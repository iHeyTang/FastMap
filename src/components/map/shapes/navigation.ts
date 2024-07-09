import { Circle, FabricObject, Line } from "fabric";
import { Coordinates } from "./base";
import { FastMap } from "../fast-map";

/**
 * 路径
 */
export class Navigation {
  fastMap: FastMap | undefined;

  shapes: FabricObject[] = [];

  key: string | number;

  /**
   * 路径点
   */
  readonly paths: (Coordinates | string | number)[];

  constructor(props: {
    fastMap: FastMap;
    key: string | number;
    paths: (number[] | Coordinates | string | number)[];
  }) {
    this.fastMap = props.fastMap;
    this.key = props.key;
    this.paths = props.paths.map((p) => {
      if (Array.isArray(p)) {
        return new Coordinates(p[0], p[1], 0);
      }
      return p;
    });
  }

  get coordinates() {
    return this.paths.map((p) =>
      typeof p === "object" ? p : this.fastMap?.getWayPoint(p)?.center
    );
  }

  draw() {
    if (!this.fastMap) return;
    const points = this.coordinates;

    points.forEach((p, index) => {
      if (!p) {
        console.warn("路径点错误", p);
        return;
      }
      const circle = new Circle({
        radius: 10,
        evented: false,
        hasControls: false,
        fill: "red",
        left: p.x,
        top: p.y,
        originX: "center",
        originY: "center",
        selectable: false,
      });
      this.shapes.push(circle);
      // 路径，线段，当前点到下一个点
      if (index < points.length - 1) {
        const line = new Line(
          [p.x, p.y, points[index + 1]!.x, points[index + 1]!.y],
          {
            evented: false,
            selectable: false,
            hasControls: false,
            hasBorders: false,
            hoverCursor: "default",
            originX: "center",
            originY: "center",
            stroke: "red",
            strokeWidth: 4,
          }
        );
        this.shapes.push(line);
        this.shapes.push(line);
      }
    });
    this.fastMap.canvas.add(...this.shapes);
  }

  clear() {
    this.fastMap?.canvas.remove(...this.shapes);
  }
}
