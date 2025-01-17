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

  fastMap: FastMap;

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
      this.polygon.map((c) => ({
        x: c.x * this.fastMap.config.scale.x,
        y: c.y * this.fastMap.config.scale.y,
      })),
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
            left: c.x * this.fastMap.config.scale.x,
            top: c.y * this.fastMap.config.scale.y,
            fill: "red",
            selectable: false,
            hoverCursor: "default",
          });

          const t = `${index}\n(${c.x},${c.y})`;

          const text = new FabricText(t, {
            evented: false,
            originX: "center",
            originY: "center",
            fontSize: 4,
            left: c.x * this.fastMap.config.scale.x,
            top: c.y * this.fastMap.config.scale.y + 8,
            text: t,
            textAlign: "center",
            hoverCursor: "default",
            selectable: false,
          });
          return [dot, text];
        })
      : [];

    this.shapes = [shape, ...dots];
    this.fastMap.add(...this.shapes);
  }
}
