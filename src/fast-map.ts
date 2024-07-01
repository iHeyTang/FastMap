import { fabric } from "fabric";
import { draggable, scalable } from "./gesture";
import {
  Coordinates,
  Road,
  RoadGait,
  RoadMode,
  RoadSpeed,
  Robot,
  WayPoint,
  WayPointType,
} from "./shapes";
import { Highlights } from "./shapes/highlights";

export type FastMapConfig = {
  draw: {
    Road: (props: {
      mode: RoadMode;
      speed: RoadSpeed;
      gait: RoadGait;
    }) => fabric.ILineOptions;
    WayPoint: (props: { type: WayPointType }) => fabric.ILineOptions;
    Robot: () => fabric.IRectOptions;
  };
};

export default class FastMap {
  canvas: fabric.Canvas;
  config: FastMapConfig;

  shapes: {
    roads: Road[];
    waypoints: WayPoint[];
    robots: Robot[];
  };

  highlights?: Highlights;

  constructor(
    element: HTMLCanvasElement | string | null,
    options: fabric.ICanvasOptions & { fastMapConfig: FastMapConfig }
  ) {
    this.shapes = { roads: [], waypoints: [], robots: [] };
    const { fastMapConfig, ...canvasOptions } = options;
    this.canvas = new fabric.Canvas(element, canvasOptions);
    this.config = fastMapConfig;
    draggable(this.canvas);
    scalable(this.canvas);
  }

  moveRobotTo(robotKey: string, coordinates: Coordinates) {
    const robot = this.shapes.robots.find((r) => r.key === robotKey);
    if (robot) {
      robot.moveTo(coordinates);
    }
  }

  addRoads(roads: Road[]) {
    for (const r of roads) {
      r.fastMap = this;
    }
    this.shapes.roads.push(...roads);
  }

  addWaypoints(waypoints: WayPoint[]) {
    for (const w of waypoints) {
      w.fastMap = this;
    }
    this.shapes.waypoints.push(...waypoints);
  }

  addRobot(robot: Robot) {
    const duplicate = this.shapes.robots.find((r) => r.key === robot.key);
    if (duplicate) {
      throw new Error(`Robot key ${robot.key} is duplicated`);
    }
    robot.fastMap = this;
    this.shapes.robots.push(robot);
    robot.draw();
  }

  initiate() {
    const center = this.getMapCenter();
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    this.canvas.viewportTransform![4] = -center.x + this.canvas.getWidth() / 2;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    this.canvas.viewportTransform![5] = center.y + this.canvas.getHeight() / 2;

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

  getRoad(key: string) {
    return this.shapes.roads.find((r) => r.key === key);
  }

  getWayPoint(key: string) {
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
}
