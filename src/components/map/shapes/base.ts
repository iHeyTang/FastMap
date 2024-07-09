/**
 * 坐标
 */
export class Coordinates {
  readonly x: number;
  readonly y: number;
  readonly z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toArr() {
    return [this.x, this.y, this.z];
  }

  toObject() {
    return { x: this.x, y: this.y, z: this.z };
  }

  static distance(c1: Coordinates, c2: Coordinates) {
    return new Coordinates(c1.x - c2.x, c1.y - c2.y, c1.z - c2.z);
  }

  static horizontalDegree(c1: Coordinates, c2: Coordinates) {
    return Math.atan2(c2.y - c1.y, c2.x - c1.x);
  }
}
