import axios from "axios";

export type FenceData = { id: number; points: number[][]; type: 0 | 1 };

export type PointData = {
  id: number;
  name: string;
  pos: number[];
  type: number;
};

export type LineData = {
  id: number;
  point: number[];
  direction: 1 | 0;
  speed: number;
  gait: number;
  radar: string;
};

export function genMapDataFetcher(tid: string) {
  async function getMapFences() {
    const res = await axios<{ fence: FenceData[] }>(
      `/patro/map/fence?tid=${tid}`
    );
    // if (data.csq !== 1) return [];
    return res.data.fence.map((f) => ({
      ...f,
      points: f.points.map((p) => [p[0], p[1]]),
    }));
  }

  async function getMapPoints() {
    const res = await axios<{ point: PointData[] }>(
      `/patro/map/point?tid=${tid}`
    );
    // if (data.csq !== 1) return [];
    return res.data.point.map((p) => ({
      ...p,
      pos: [p.pos[0], p.pos[1], p.pos[2]],
    }));
  }

  async function getMapLines() {
    const res = await axios<{ line: LineData[] }>(`/patro/map/line?tid=${tid}`);
    // if (data.csq !== 1) return [];
    return res.data.line;
  }

  async function navigationPlan(
    peri_id: string,
    point: string | number | number[],
    yaw: number
  ) {
    try {
      const res = await axios<{
        code: number;
        peri_id: string;
        point: number;
        path: (number | number[])[];
      }>("/patro/navigation/plan", {
        method: "POST",
        data: {
          tid,
          peri_id: peri_id,
          point: Array.isArray(point) ? undefined : point,
          pos: Array.isArray(point) ? point : undefined,
          yaw: yaw,
        },
      });
      return {
        code: res.data.code,
        peri_id: res.data.peri_id,
        point: res.data.point,
        path: res.data.path,
      };
    } catch (e) {
      return {};
    }
  }

  async function navigationStop(peri_id: string) {
    try {
      const res = await axios<{
        code: number;
        peri_id: string;
        point: number;
        path: number[];
      }>("/patro/navigation/stop", {
        method: "POST",
        data: { tid, peri_id: peri_id },
      });
      return res.data;
    } catch (e) {
      return { code: 1 };
    }
  }

  function createRobotStatusSocket() {
    const href = `ws://122.224.165.90:39014/ws`;
    let robotStatusSocket = new WebSocket(href);
    robotStatusSocket.onopen = () => {
      console.log("ws opened");
    };
    robotStatusSocket.onmessage = (event) => {
      console.log(event.data);
    };
    // 心跳，每10秒一次，若socket被关闭，重新打开
    setInterval(() => {
      if (robotStatusSocket.readyState === WebSocket.CLOSED) {
        robotStatusSocket = new WebSocket(href);
      } else {
        robotStatusSocket.send(JSON.stringify({ heartbeat: 1 }));
      }
    }, 5000);
    return {
      ws: robotStatusSocket,
      onData: (cb: (this: WebSocket, ev: MessageEvent) => void) => {
        robotStatusSocket.onmessage = cb;
      },
    };
  }

  return {
    getMapFences,
    getMapPoints,
    getMapLines,
    navigationPlan,
    navigationStop,
    createRobotStatusSocket,
  };
}
