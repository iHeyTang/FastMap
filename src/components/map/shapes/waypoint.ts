import { FastMap } from "../fast-map";
import { Coordinates } from "./base";
import { Circle, CircleProps, FabricObject, TOptions } from "fabric";

export type WayPointType = "charge" | "chargePrepare" | "return" | "task";

/**
 * 点位
 */
export class WayPoint {
  fastMap: FastMap | undefined;

  shapes: FabricObject[] = [];

  key: string | number;

  hovering?: boolean;

  /**
   * 点位类型
   * charge: 充电点
   * return: 掉头点
   * task: 任务点
   */
  readonly type: WayPointType;

  readonly center: Coordinates;

  private dynamicOptions: TOptions<CircleProps> = {};

  constructor(props: {
    fastMap: FastMap;
    key: string | number;
    type: WayPointType;
    center: Coordinates;
  }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.type = props.type;
    this.center = props.center;
  }

  draw() {
    const circle = new Circle({
      hasBorders: false,
      hasControls: false,
      radius: 5,
      originX: "center",
      originY: "center",
      left: this.center.x,
      top: this.center.y,
      fill: undefined,
      strokeWidth: 1,
      hoverCursor: "pointer",
      ...this.fastMap?.config?.draw?.WayPoint({ type: this.type }),
      ...this.dynamicOptions,
      ...(this.hovering
        ? { fill: "#099268", stroke: "#099268", radius: 20 }
        : {}),
    });
    this.shapes = [circle];
    this.fastMap?.canvas?.add(...this.shapes);
  }

  setDynamicOptions(options: TOptions<CircleProps>) {
    this.dynamicOptions = options;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }

  hover(hover: boolean) {
    this.hovering = hover;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }
}