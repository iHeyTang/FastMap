import { default as DefaultFastMap } from "./fast-map";
import { Road, Robot, WayPoint, Coordinates, Fence } from "./shapes";
import { Highlights } from "./shapes/highlights";

const FastMap: typeof DefaultFastMap & {
  Robot?: typeof Robot;
  Road?: typeof Road;
  Coordinates?: typeof Coordinates;
  WayPoint?: typeof WayPoint;
  Highlights?: typeof Highlights;
  Fence?: typeof Fence;
} = DefaultFastMap;

FastMap.Robot = Robot;
FastMap.Road = Road;
FastMap.Coordinates = Coordinates;
FastMap.WayPoint = WayPoint;
FastMap.Highlights = Highlights;
FastMap.Fence = Fence;

declare global {
  interface Window {
    FastMap: typeof FastMap;
  }
}

window.FastMap = FastMap;
