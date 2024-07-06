import axios from "axios";

const HOST = import.meta.env.VITE_SERVER_HOST || "localhost:3000";
const HTTP_SEVER_HOST = `http://${HOST}`;
const WS_SERVER_HOST = `ws://${HOST}/ws`;

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
      `${HTTP_SEVER_HOST}/patro/map/fence?tid=${tid}`
    );
    // if (data.csq !== 1) return [];
    return res.data.fence.map((f) => ({
      ...f,
      points: f.points.map((p) => [p[0], -p[1]]),
    }));
  }

  async function getMapPoints() {
    const res = await axios<{ point: PointData[] }>(
      `${HTTP_SEVER_HOST}/patro/map/point?tid=${tid}`
    );
    // if (data.csq !== 1) return [];
    return res.data.point.map((p) => ({
      ...p,
      pos: [p.pos[0], -p.pos[1], p.pos[2]],
    }));
  }

  async function getMapLines() {
    const res = await axios<{ line: LineData[] }>(
      `${HTTP_SEVER_HOST}/patro/map/line?tid=${tid}`
    );
    // if (data.csq !== 1) return [];
    return res.data.line;
  }

  async function navigationPlan(peri_id: string, point: string | number) {
    try {
      const res = await axios<{
        code: number;
        peri_id: string;
        point: number;
        path: number[];
      }>(`${HTTP_SEVER_HOST}/patro/navigation/plan`, {
        method: "POST",
        data: { tid, peri_id: peri_id, point },
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
      }>(`${HTTP_SEVER_HOST}/patro/navigation/stop`, {
        method: "POST",
        data: { tid, peri_id: peri_id },
      });
      return res.data;
    } catch (e) {
      return { code: 1 };
    }
  }

  function createRobotStatusSocket() {
    const robotStatusSocket = new WebSocket(`${WS_SERVER_HOST}`);
    robotStatusSocket.onopen = () => {
      console.log("ws opened");
    };
    robotStatusSocket.onmessage = (event) => {
      console.log(event.data);
    };
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
