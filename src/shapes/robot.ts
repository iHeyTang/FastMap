import { fabric } from "fabric";
import { Coordinates } from "./base";
import FastMap from "../fast-map";
import Avatar from "./avatar.jpg";

/**
 * 机器人
 */
export class Robot {
  key: string;

  fastMap: FastMap | undefined;

  shapes: fabric.Object[] = [];

  center: Coordinates;

  angle: number;

  /**
   * 动态参数，用于动态调整路径样式，如路径颜色、宽度等
   */
  private dynamicRectOptions: fabric.ILineOptions = {};

  private dynamicTextOptions: fabric.ITextOptions = {};

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
    fabric.Image.fromURL(Avatar, (img) => {
      img.scale(0.5).set({
        scaleX: 0.05,
        scaleY: 0.05,
        originX: "center",
        originY: "center",
        left: this.center.x,
        top: this.center.y,
        angle: this.angle,
      });
      img.lockScalingFlip = true;
      img.minScaleLimit = 0.025;
      img.padding = 5;
      img.hoverCursor = "crossHair";
      this.fastMap?.canvas?.add(img);
    });

    const rect = new fabric.Rect({
      evented: false,
      selectable: false,
      originX: "center",
      originY: "center",
      left: this.center.x,
      top: this.center.y,
      width: 40,
      height: 40,
      fill: "#f59f00",
      angle: this.angle,
    });
    const triangle = new fabric.Triangle({
      width: 60,
      height: 60,
      evented: false,
      fill: "#f59f00",
      originX: "center",
      originY: "bottom",
      left: this.center.x,
      top: this.center.y,
      angle: this.angle,
    });

    const text = new fabric.Text(this.key, {
      originX: "center",
      originY: "center",
      fontSize: 12,
      left: this.center.x,
      top: this.center.y,
      text: this.key,
      selectable: false,
      ...this.fastMap?.config?.draw?.Robot,
      ...this.dynamicTextOptions,
    });

    this.shapes = [rect, triangle, text];
    this.fastMap?.canvas?.add(...this.shapes);
  }

  setDynamicRectOptions(options: fabric.ILineOptions) {
    this.dynamicRectOptions = options;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }

  setDynamicTextOptions(options: fabric.ITextOptions) {
    this.dynamicTextOptions = options;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }
}
