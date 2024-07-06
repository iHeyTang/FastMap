import { Circle, FabricObject, FabricText, Polygon } from "fabric";
import { Coordinates } from "./base";
import { FastMap } from "../fast-map";

/**
 * 类型是边界或障碍物
 */
export type FenceType = "boundary" | "obstacle";

/**
 * 围栏
 */
export class Fence {
  key: string | number;

  fastMap: FastMap | undefined;

  shapes: FabricObject[] = [];

  /**
   * 一组坐标点，组成一个多边形
   */
  polygon: Coordinates[];

  type: FenceType;

  constructor(props: {
    key: string | number;
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
    const shape = new Polygon(
      this.polygon.map((c) => ({ x: c.x, y: c.y })),
      {
        evented: false,
        selectable: false,
        fill: "rgba(255, 255, 255, 0.1)",
        hoverCursor: "default",
        ...this.fastMap?.config?.draw?.Fence({ type: this.type }),
      }
    );

    const dots = this.fastMap?.debug
      ? this.polygon.flatMap((c, index) => {
          const dot = new Circle({
            evented: false,
            radius: 2,
            originX: "center",
            originY: "center",
            left: c.x,
            top: c.y,
            fill: "red",
            selectable: false,
            hoverCursor: "default",
          });

          const text = new FabricText(
            `${index}(${c.x.toFixed(4)},${c.y.toFixed(4)})`,
            {
              evented: false,
              originX: "center",
              originY: "center",
              fontSize: 8,
              left: c.x,
              top: c.y + 12,
              text: `${index}(${c.x.toFixed(4)},${c.y.toFixed(4)})`,
              hoverCursor: "default",
              selectable: false,
            }
          );
          return [dot, text];
        })
      : [];

    this.shapes = [shape, ...dots];
    this.fastMap?.canvas?.add(...this.shapes);
  }
}
