import {
  FabricText,
  FabricObject,
  Circle,
  Triangle,
  TPointerEvent,
  TPointerEventInfo,
} from "fabric";
import { Coordinates } from "./base";
import { FastMap } from "../fast-map";

export type IndicatorResult = {
  x: number;
  y: number;
  angle: number;
  waypointKey?: string | number;
};

/**
 * 点位
 */
export class Indicator {
  fastMap: FastMap;

  shapes: FabricObject[] = [];

  hovering?: boolean;

  angle: number;

  readonly center: Coordinates;

  onIndicate: (
    data: IndicatorResult,
    originEvent: TPointerEventInfo<TPointerEvent>
  ) => void;

  constructor(props: {
    fastMap: FastMap;
    center: Coordinates;
    onIndicate: (
      data: IndicatorResult,
      originEvent: TPointerEventInfo<TPointerEvent>
    ) => void;
  }) {
    this.angle = 0;
    this.fastMap = props.fastMap;
    this.center = props.center;
    this.onIndicate = props.onIndicate;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.fastMap.canvas?.on("mouse:move", this.onMouseMove);
    this.fastMap.canvas?.on("mouse:up", this.onMouseUp);
  }

  draw() {
    const circle = new Circle({
      radius: 30,
      evented: false,
      hasControls: false,
      hasBorders: false,
      originX: "center",
      originY: "center",
      left: this.center.x * this.fastMap.config.scale.x,
      top: this.center.y * this.fastMap.config.scale.y,
      fill: "#1890ff",
      strokeWidth: 1,
      hoverCursor: "pointer",
    });
    const text = new FabricText(`${this.angle}`, {
      evented: false,
      originX: "center",
      originY: "center",
      fontSize: 16,
      text: `${this.angle}`,
      left: this.center.x * this.fastMap.config.scale.x,
      top: this.center.y * this.fastMap.config.scale.y,
      fill: "#fff",
    });
    // 在this.center处画扇形，角度为this.angle，画个三角表示方向
    const triangle = new Triangle({
      width: 60,
      height: 45,
      evented: false,
      fill: "#fa5252",
      originX: "center",
      originY: "bottom",
      left: this.center.x * this.fastMap.config.scale.x,
      top: this.center.y * this.fastMap.config.scale.y,
      angle: -this.angle + 90,
    });

    this.shapes = [triangle, circle, text];
    this.fastMap?.canvas?.add(...this.shapes);
  }

  onMouseMove(event: TPointerEventInfo<TPointerEvent>) {
    if (!this.fastMap?.canvas) return;

    const pointer = this.fastMap.getCoordinates(event);
    // 角度为0到360，从右边开始逆时针计算
    const angle = Math.atan2(
      pointer.y - this.center.y,
      pointer.x - this.center.x
    );
    this.angle = Math.round((angle * 180) / Math.PI);
    this.angle = this.angle < 0 ? this.angle + 360 : this.angle;
    console.log("🚀 ~ Indicator ~ onMouseMove ~ angle:", this.angle);
    this.fastMap.canvas.remove(...this.shapes);
    this.draw();
  }

  onMouseUp(event: TPointerEventInfo<TPointerEvent>) {
    if (!this.fastMap?.canvas) return;
    this.fastMap.canvas.remove(...this.shapes);
    this.shapes = [];

    const activeObject = this.fastMap.canvas.getActiveObject();
    const waypoint =
      activeObject?.type === "circle"
        ? this.fastMap.getWayPoint(activeObject)
        : null;

    this.onIndicate(
      {
        angle: this.angle,
        x: this.center.x,
        y: this.center.y,
        waypointKey: waypoint?.key,
      },
      event
    );
    this.fastMap.canvas.off("mouse:move", this.onMouseMove);
    this.fastMap.canvas.off("mouse:up", this.onMouseUp);
  }
}
