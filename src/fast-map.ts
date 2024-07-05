import { fabric } from "fabric";
import { handleClick, handleDbClick, handleDrag, handleScale } from "./gesture";
import {
  Coordinates,
  Fence,
  FenceType,
  Road,
  RoadGait,
  RoadMode,
  RoadSpeed,
  Robot,
  WayPoint,
  WayPointType,
} from "./shapes";
import { Highlights } from "./shapes/highlights";
import { Indicator } from "./shapes/indicator";
import { antiShake } from "./utils";

export type FastMapConfig = {
  draw: {
    // 初始化取中心时感觉会有点偏移，原因暂时不明，这里加了一个偏移量
    initOffset: [number, number];
    Road: (props: {
      mode: RoadMode;
      speed: RoadSpeed;
      gait: RoadGait;
    }) => fabric.ILineOptions;
    WayPoint: (props: { type: WayPointType }) => fabric.ILineOptions;
    Robot: () => fabric.IRectOptions;
    Fence: (props: { type: FenceType }) => fabric.ILineOptions;
  };
};

export default class FastMap {
  canvas: fabric.Canvas;
  config: FastMapConfig;

  debug?: boolean;

  shapes: {
    indicator: Indicator | null;
    fences: Fence[];
    roads: Road[];
    waypoints: WayPoint[];
    robots: Robot[];
  };

  highlights?: Highlights;

  hovering?: string;

  constructor(
    element: HTMLCanvasElement | string | null,
    options: fabric.ICanvasOptions & {
      fastMapConfig: FastMapConfig;
    }
  ) {
    this.shapes = {
      fences: [],
      roads: [],
      waypoints: [],
      robots: [],
      indicator: null,
    };
    const { fastMapConfig, ...canvasOptions } = options;
    this.canvas = new fabric.Canvas(element, {
      ...canvasOptions,
    });
    this.config = fastMapConfig;
  }

  /**
   * 添加围栏
   * @param fences
   */
  addFences(fences: Fence[]) {
    for (const f of fences) {
      f.fastMap = this;
    }
    this.shapes.fences.push(...fences);
  }

  /**
   * 添加道路
   * @param roads
   */
  addRoads(roads: Road[]) {
    for (const r of roads) {
      r.fastMap = this;
    }
    this.shapes.roads.push(...roads);
  }

  /**
   * 添加路点
   * @param waypoints
   */
  addWaypoints(waypoints: WayPoint[]) {
    for (const w of waypoints) {
      w.fastMap = this;
    }
    this.shapes.waypoints.push(...waypoints);
  }

  /**
   * 添加机器人
   * @param robot
   */
  addRobot(robot: Robot) {
    const duplicate = this.shapes.robots.find((r) => r.key === robot.key);
    if (duplicate) {
      throw new Error(`Robot key ${robot.key} is duplicated`);
    }
    robot.fastMap = this;
    this.shapes.robots.push(robot);
    robot.draw();
  }

  /**
   * 设置机器人位置
   * @param robotKey
   * @param coordinates
   */
  setRobotTo(robotKey: string, coordinates: Coordinates) {
    const robot = this.shapes.robots.find((r) => r.key === robotKey);
    if (robot) {
      robot.moveTo(coordinates);
    }
  }

  /**
   * 地图视图初始化
   */
  initiate() {
    this.canvas.add(
      new fabric.Circle({
        evented: false,
        radius: 1,
        originX: "center",
        originY: "center",
        left: 0,
        top: 0,
        fill: "red",
        selectable: false,
        hoverCursor: "default",
      })
    );

    const center = this.getMapCenter();
    const viewportTransform = this.canvas.viewportTransform || [];
    viewportTransform[4] =
      -center.x + this.canvas.getCenter().left + this.config.draw.initOffset[0];
    viewportTransform[5] =
      -center.y + this.canvas.getCenter().top + this.config.draw.initOffset[1];
    this.canvas.setViewportTransform(viewportTransform);

    for (let i = 0; i < this.shapes.fences.length; i++) {
      this.shapes.fences[i].fastMap = this;
      this.shapes.fences[i].draw();
    }

    for (let i = 0; i < this.shapes.roads.length; i++) {
      this.shapes.roads[i].fastMap = this;
      this.shapes.roads[i].draw();
    }

    for (let i = 0; i < this.shapes.waypoints.length; i++) {
      this.shapes.waypoints[i].fastMap = this;
      this.shapes.waypoints[i].draw();
    }
  }

  highlight(highlights: Highlights) {
    this.clearHighlight();
    this.highlights = highlights;
    this.highlights.highlight();
  }

  clearHighlight() {
    this.highlights?.deHighlight();
    this.highlights = undefined;
  }

  indicate(
    coordinates: Coordinates,
    onIndicate: (e: fabric.IEvent, data: { angle: number }) => void
  ) {
    this.shapes.indicator = new Indicator({
      fastMap: this,
      center: coordinates,
      onIndicate: onIndicate,
    });
    this.shapes.indicator.draw();
  }

  getRoad(key: string) {
    return this.shapes.roads.find((r) => r.key === key);
  }

  getWayPoint(key: string | fabric.Object) {
    if (typeof key === "object" && key.type === "circle") {
      return this.shapes.waypoints.find((w) => w.shapes.includes(key));
    }
    return this.shapes.waypoints.find((w) => w.key === key);
  }

  getMapCoordinatesOfPoints() {
    const points: Coordinates[] = [];
    for (let i = 0; i < this.shapes.waypoints.length; i++) {
      points.push(this.shapes.waypoints[i].center);
    }
    for (let i = 0; i < this.shapes.roads.length; i++) {
      const [begin, end] = [
        this.shapes.roads[i].beginCoordinates,
        this.shapes.roads[i].endCoordinates,
      ];
      if (begin) points.push(begin);
      if (end) points.push(end);
    }
    for (let i = 0; i < this.shapes.fences.length; i++) {
      points.push(...this.shapes.fences[i].polygon);
    }
    return points;
  }

  getMapBound() {
    const points = this.getMapCoordinatesOfPoints();

    let x1 = Infinity;
    let x2 = -Infinity;
    let y1 = -Infinity;
    let y2 = Infinity;
    let z1 = Infinity;
    let z2 = -Infinity;

    for (let i = 0; i < points.length; i++) {
      x1 = Math.min(x1, points[i].x);
      x2 = Math.max(x2, points[i].x);
      y1 = Math.max(y1, points[i].y);
      y2 = Math.min(y2, points[i].y);
      z1 = Math.min(z1, points[i].z);
      z2 = Math.max(z2, points[i].z);
    }

    return { x1, x2, y1, y2, z1, z2 };
  }

  /**
   * 计算画布中心点
   */
  getMapCenter() {
    const { x1, x2, y1, y2, z1, z2 } = this.getMapBound();
    return new Coordinates((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
  }

  initEventHandler(handlers: {
    onFastMapClick?: (fastMap: FastMap, e: fabric.IEvent<MouseEvent>) => void;
    onFastMapDbClick?: (fastMap: FastMap, e: fabric.IEvent<MouseEvent>) => void;
  }) {
    handleDrag(this.canvas);
    handleScale(this.canvas);
    handleClick(this.canvas, (event) => {
      handlers.onFastMapClick?.(this, event);
    });
    handleDbClick(this.canvas, (event) => {
      handlers.onFastMapDbClick?.(this, event);
    });

    this.canvas.on("mouse:over", (e) => {
      antiShake(() => {
        if (e.target?.type === "circle") {
          const waypoint = this.getWayPoint(e.target);
          if (waypoint) {
            waypoint.hover(true);
            this.hovering = waypoint.key;
          }
        }
      }, 200)();
    });

    this.canvas.on("mouse:out", (e) => {
      antiShake(() => {
        if (this.hovering) {
          const waypoint = this.getWayPoint(this.hovering);
          if (waypoint) {
            waypoint.hover(false);
          }
          this.hovering = undefined;
        }
      }, 200)();
    });
  }
}
