import { FabricImage, FabricObject } from "fabric";
import RobotImage from "../../../assets/robot.jpg";
import { FastMap } from "../fast-map";
import { Coordinates } from "./base";

/**
 * 机器人
 */
export class Robot {
  key: string;

  fastMap: FastMap | undefined;

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
    this.center = center;
    this.angle = angle || this.angle;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }

  draw() {
    FabricImage.fromURL(RobotImage).then((img) => {
      img.set({
        evented: false,
        scaleX: 0.7,
        scaleY: 0.7,
        originX: "center",
        originY: "center",
        left: this.center.x,
        top: this.center.y,
        angle: this.angle,
      });
      img.lockScalingFlip = true;
      img.minScaleLimit = 0.025;
      img.padding = 5;
      this.fastMap?.canvas?.add(img);
    });
  }
}
