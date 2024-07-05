import { fabric } from "fabric";
import { Coordinates } from "./base";
import FastMap from "../fast-map";

export type RoadMode = "one-way" | "two-way";
export type RoadSpeed = number;
export type RoadGait = "flat" | "slope" | "stairs";

/**
 * 路径
 */
export class Road {
  fastMap: FastMap | undefined;

  shapes: fabric.Object[] = [];

  key: string;

  /**
   * 通行模式
   * 1: 单向
   * 2: 双向
   */
  readonly mode: RoadMode;
  /**
   * 速度等级
   * 1: 最慢
   * 2: 中等
   * 3: 最快
   */
  readonly speed: RoadSpeed;
  /**
   * 路径类型
   * flat: 平路
   * slope: 坡道
   * stairs: 楼梯
   */
  readonly gait: RoadGait;

  /**
   * 起点
   */
  readonly begin: Coordinates | string;

  /**
   * 终点
   */
  readonly end: Coordinates | string;

  /**
   * 动态参数，用于动态调整路径样式，如路径颜色、宽度等
   */
  private dynamicOptions: fabric.ILineOptions = {};

  constructor(props: {
    fastMap: FastMap;
    key: string;
    mode: RoadMode;
    speed: RoadSpeed;
    gait: RoadGait;
    begin: Coordinates | string;
    end: Coordinates | string;
  }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.mode = props.mode;
    this.speed = props.speed;
    this.gait = props.gait;
    this.begin = props.begin;
    this.end = props.end;
  }

  get beginCoordinates() {
    return typeof this.begin !== "object"
      ? this.fastMap?.getWayPoint(this.begin)?.center
      : this.begin;
  }

  get endCoordinates() {
    return typeof this.end !== "object"
      ? this.fastMap?.getWayPoint(this.end)?.center
      : this.end;
  }

  get diff() {
    const [begin, end] = [this.beginCoordinates, this.endCoordinates];
    if (!begin || !end) return NaN;
    return Coordinates.distance(begin, end);
  }

  get horizontalDegree() {
    const [begin, end] = [this.beginCoordinates, this.endCoordinates];
    if (!begin || !end) return NaN;
    return Coordinates.horizontalDegree(begin, end);
  }

  draw() {
    const [begin, end] = [this.beginCoordinates, this.endCoordinates];
    if (!begin || !end) return;

    const line = new fabric.Line([begin.x, begin.y, end.x, end.y], {
      evented: false,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      hoverCursor: "default",
      originX: "center",
      originY: "center",
      ...this.fastMap?.config?.draw?.Road({
        mode: this.mode,
        speed: this.speed,
        gait: this.gait,
      }),
      ...this.dynamicOptions,
    });

    const title = this.fastMap?.debug
      ? [
          new fabric.Text(`${this.key}`, {
            evented: false,
            hasBorders: false,
            hasControls: false,
            originX: "center",
            originY: "center",
            fontSize: 12,
            left: (begin.x + end.x) / 2,
            top: (begin.y + end.y) / 2,
            text: `${this.key}`,
            hoverCursor: "default",
            selectable: false,
          }),
        ]
      : [];

    const dots = this.fastMap?.debug
      ? [begin, end].map((c) => {
          const text = new fabric.Text(
            `(${c?.x.toFixed(4)},${c.y.toFixed(4)})`,
            {
              evented: false,
              hasBorders: false,
              hasControls: false,
              originX: "center",
              originY: "center",
              fontSize: 8,
              left: c.x,
              top: c.y + 12,
              text: `(${c?.x.toFixed(4)},${c.y.toFixed(4)})`,
              hoverCursor: "default",
              selectable: false,
            }
          );
          return text;
        })
      : [];

    this.shapes = [line, ...dots, ...title];
    this.fastMap?.canvas?.add(...this.shapes);
  }

  setDynamicOptions(options: fabric.ILineOptions) {
    this.dynamicOptions = options;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }
}
