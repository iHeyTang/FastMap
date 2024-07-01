import FastMap from "../fast-map";

export type RoadMode = "one-way" | "two-way";
export type RoadSpeed = "1" | "2" | "3";
export type RoadGait = "flat" | "slope" | "stairs";

/**
 * 高亮，可通过路径高亮/点位高亮/机器人高亮等，来实现路径规划展示、任务规划展示等功能
 */
export class Highlights {
  fastMap: FastMap | undefined;

  robotKeys: string[] = [];
  roadKeys: string[] = [];
  waypointKeys: string[] = [];

  roadOptions: fabric.ILineOptions = {};
  waypointOptions: fabric.ICircleOptions = {};
  robotRectOptions: fabric.IRectOptions = {};

  constructor(props: {
    fastMap: FastMap;
    robotKeys?: string[];
    roadKeys?: string[];
    waypointKeys?: string[];
    robotRectOptions?: fabric.IRectOptions;
    roadOptions?: fabric.ILineOptions;
    waypointOptions?: fabric.ICircleOptions;
  }) {
    this.fastMap = props.fastMap;

    this.robotKeys = props.robotKeys || [];
    this.roadKeys = props.roadKeys || [];
    this.waypointKeys = props.waypointKeys || [];

    this.robotRectOptions = props.robotRectOptions || {};
    this.roadOptions = props.roadOptions || {};
    this.waypointOptions = props.waypointOptions || {};
  }

  get matchedRoads() {
    return this.fastMap?.shapes.roads.filter((r) =>
      this.roadKeys.includes(r.key)
    );
  }

  get matchedWayPoints() {
    return this.fastMap?.shapes.waypoints.filter((w) =>
      this.waypointKeys.includes(w.key)
    );
  }

  get matchedRobots() {
    return this.fastMap?.shapes.robots.filter((r) =>
      this.robotKeys.includes(r.key)
    );
  }

  highlight() {
    for (const road of this.matchedRoads || []) {
      road.setDynamicOptions(this.roadOptions);
    }

    for (const waypoint of this.matchedWayPoints || []) {
      waypoint.setDynamicOptions(this.waypointOptions);
    }

    for (const robot of this.matchedRobots || []) {
      robot.setDynamicRectOptions(this.robotRectOptions);
    }

    this.fastMap?.canvas?.requestRenderAll();
  }

  deHighlight() {
    for (const road of this.matchedRoads || []) {
      road.setDynamicOptions({});
    }

    for (const waypoint of this.matchedWayPoints || []) {
      waypoint.setDynamicOptions({});
    }

    for (const robot of this.matchedRobots || []) {
      robot.setDynamicRectOptions({});
    }

    this.fastMap?.canvas?.requestRenderAll();
  }
}
