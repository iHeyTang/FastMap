import { FabricImage, FabricObject, FabricText } from "fabric";
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

  get title() {
    const yaw = ((this.angle / 180) * Math.PI).toFixed(2);
    return `${this.key}\n(${this.center.x}, ${this.center.y})\n${yaw}`;
  }

  moveTo(center: Coordinates, angle?: number) {
    this.center = center;
    this.angle = angle || this.angle;
    this.shapes.forEach((s) => {
      if (s.type !== "text") {
        s.set({
          left: this.center.x * this.fastMap.config.scale.x,
          top: this.center.y * this.fastMap.config.scale.y,
          angle: -this.angle,
        });
      } else {
        s.set({
          text: this.title,
          left: this.center.x * this.fastMap.config.scale.x,
          top: this.center.y * this.fastMap.config.scale.y + 48,
        });
      }
    });
    this.fastMap.canvas.requestRenderAll();
  }

  async draw() {
    const img = await FabricImage.fromURL(RobotImage, undefined, {
      evented: false,
      scaleX: 0.02,
      scaleY: 0.02,
      originX: "center",
      originY: "center",
      left: this.center.x * this.fastMap.config.scale.x,
      top: this.center.y * this.fastMap.config.scale.y,
      angle: -this.angle,
    });

    const title = new FabricText(this.title, {
      evented: false,
      hasBorders: false,
      hasControls: false,
      originX: "center",
      originY: "center",
      fontSize: 12,
      textAlign: "center",
      left: this.center.x * this.fastMap.config.scale.x,
      top: this.center.y * this.fastMap.config.scale.y + 48,
      hoverCursor: "default",
      selectable: false,
    });

    this.shapes.push(img, title);
    this.fastMap.add(...this.shapes);
  }

  clear() {
    this.fastMap.canvas.remove(...this.shapes);
    this.shapes = [];
  }
}
