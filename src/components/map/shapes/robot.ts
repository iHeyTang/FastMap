import { FabricImage, FabricObject } from "fabric";
import RobotImage from "../../../assets/robot.jpg";
import { FastMap } from "../fast-map";
import { Coordinates } from "./base";

/**
 * 机器人
 */
export class Robot {
  key: string;

  fastMap: FastMap;

  shapes: FabricObject[] = [];

  center: Coordinates;

  angle: number;

  constructor(props: {
    key: string;
    fastMap: FastMap;
    center: Coordinates;
    angle?: number;
  }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.center = props.center;
    this.angle = props.angle || 0;
  }

  moveTo(center: Coordinates, angle?: number) {
    this.clear();
    this.center = center;
    this.angle = angle || this.angle;
    this.draw();
  }

  async draw() {
    const img = await FabricImage.fromURL(RobotImage, undefined, {
      evented: false,
      scaleX: 0.02,
      scaleY: 0.02,
      originX: "center",
      originY: "center",
      left: this.center.x,
      top: this.center.y,
      angle: this.angle,
    });

    this.shapes.push(img);
    this.fastMap.canvas.add(...this.shapes);
  }

  clear() {
    this.fastMap.canvas.remove(...this.shapes);
    this.shapes = [];
  }
}
