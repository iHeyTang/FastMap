import { fabric } from "fabric";
import { Coordinates } from "./base";
import FastMap from "../fast-map";
import { antiShake } from "../utils";

/**
 * 点位
 */
export class Indicator {
  fastMap: FastMap | undefined;

  shapes: fabric.Object[] = [];

  hovering?: boolean;

  angle: number;

  readonly center: Coordinates;

  onIndicate: (e: fabric.IEvent<MouseEvent>, data: { angle: number }) => void;

  constructor(props: {
    fastMap: FastMap;
    center: Coordinates;
    onIndicate: (e: fabric.IEvent<MouseEvent>, data: { angle: number }) => void;
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
    const circle = new fabric.Circle({
      radius: 30,
      evented: false,
      hasControls: false,
      hasBorders: false,
      originX: "center",
      originY: "center",
      left: this.center.x,
      top: this.center.y,
      fill: "#1890ff",
      strokeWidth: 1,
      hoverCursor: "pointer",
    });
    const text = new fabric.Text(`${this.angle}`, {
      evented: false,
      originX: "center",
      originY: "center",
      fontSize: 16,
      text: `${this.angle}`,
      left: this.center.x,
      top: this.center.y,
      fill: "#fff",
    });
    // 在this.center处画扇形，角度为this.angle，画个三角表示方向
    const triangle = new fabric.Triangle({
      width: 60,
      height: 45,
      evented: false,
      fill: "#fa5252",
      originX: "center",
      originY: "bottom",
      left: this.center.x,
      top: this.center.y,
      angle: this.angle,
    });

    this.shapes = [triangle, circle, text];
    this.fastMap?.canvas?.add(...this.shapes);
  }

  onMouseMove(event: fabric.IEvent) {
    if (!this.fastMap?.canvas) return;

    const pointer = this.fastMap.canvas.getPointer(event.e);
    // 计算角度
    const angle = Math.atan2(
      pointer.y - this.center.y,
      pointer.x - this.center.x
    );
    // 角度为0到360，从正上方开始算
    this.angle = Math.round((angle * 180) / Math.PI + 90);
    if (this.angle < 0) this.angle += 360;
    this.fastMap.canvas.remove(...this.shapes);
    this.draw();
  }

  onMouseUp(event: fabric.IEvent) {
    if (!this.fastMap?.canvas) return;
    this.fastMap.canvas.remove(...this.shapes);
    this.shapes = [];
    this.onIndicate(event as fabric.IEvent<MouseEvent>, { angle: this.angle });
    this.fastMap.canvas.off("mouse:move", this.onMouseMove);
    this.fastMap.canvas.off("mouse:up", this.onMouseUp);
  }
}
