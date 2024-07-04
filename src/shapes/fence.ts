import { fabric } from "fabric";
import { Coordinates } from "./base";
import FastMap from "../fast-map";

/**
 * 类型是边界或障碍物
 */
export type FenceType = "boundary" | "obstacle";

/**
 * 围栏
 */
export class Fence {
  key: string;

  fastMap: FastMap | undefined;

  shapes: fabric.Object[] = [];

  /**
   * 一组坐标点，组成一个多边形
   */
  polygon: Coordinates[];

  type: FenceType;

  constructor(props: {
    key: string;
    fastMap: FastMap;
    polygon: Coordinates[];
    type: FenceType;
  }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.polygon = props.polygon;
    this.type = props.type;
  }

  draw() {
    const shape = new fabric.Polygon(
      this.polygon.map((c) => ({ x: c.x, y: -c.y })),
      {
        fill: "rgba(0, 0, 0, 0.1)",
        evented: false,
        selectable: false,
        hoverCursor: "default",
        ...this.fastMap?.config?.draw?.Fence({ type: this.type }),
      }
    );
    shape.hasBorders = shape.hasControls = false;

    const dots = this.fastMap?.debug
      ? this.polygon.flatMap((c, index) => {
          const dot = new fabric.Circle({
            radius: 2,
            originX: "center",
            originY: "center",
            left: c.x,
            top: -c.y,
            fill: "red",
            selectable: false,
            hoverCursor: "default",
          });
          dot.hasBorders = dot.hasControls = false;

          const text = new fabric.Text(
            `${index}(${c.x.toFixed(4)},${-c.y.toFixed(4)})`,
            {
              originX: "center",
              originY: "center",
              fontSize: 12,
              left: c.x,
              top: -c.y + 12,
              text: `${index}(${c.x.toFixed(4)},${-c.y.toFixed(4)})`,
              hoverCursor: "default",
              selectable: false,
            }
          );
          text.hasBorders = text.hasControls = false;
          return [dot, text];
        })
      : [];

    this.shapes = [shape, ...dots];
    this.fastMap?.canvas?.add(...this.shapes);
  }
}