import { fabric } from "fabric";
import { Coordinates } from "./base";
import FastMap from "../fast-map";

/**
 * 机器人
 */
export class Robot {
  key: string;

  fastMap: FastMap | undefined;

  shapes: fabric.Object[] = [];

  center: Coordinates;

  /**
   * 动态参数，用于动态调整路径样式，如路径颜色、宽度等
   */
  private dynamicRectOptions: fabric.ILineOptions = {};

  private dynamicTextOptions: fabric.ITextOptions = {};

  constructor(props: { key: string; fastMap: FastMap; center: Coordinates }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.center = props.center;
  }

  moveTo(center: Coordinates) {
    this.center = center;
    if (this.shapes) this.fastMap?.canvas?.remove(...this.shapes);
    this.draw();
  }

  draw() {
    const shape = new fabric.Rect({
      width: 5,
      height: 5,
      originX: "center",
      originY: "center",
      left: this.center.x,
      top: -this.center.y,
      fill: "black",
      selectable: false,
      ...this.fastMap?.config?.draw?.Robot(),
      ...this.dynamicRectOptions,
    });
    const text = new fabric.Text(this.key, {
      originX: "center",
      originY: "center",
      fontSize: 12,
      left: this.center.x,
      top: -this.center.y + 12,
      text: this.key,
      selectable: false,
      ...this.fastMap?.config?.draw?.Robot,
      ...this.dynamicTextOptions,
    });
    this.shapes = [shape, text];
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
