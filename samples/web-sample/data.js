const HTTP_SEVER_HOST = "http://localhost:3000";
const WS_SERVER_HOST = "ws://localhost:3001";

/**
 *
 * @param {string} tid 隧道编号
 *
 */
window.genMapDataFetcher = function genMapDataFetcher(tid) {
  /**
   * @typedef {{ id: number, name: string, pos: [number,number,number], type: number }} Point
   * @returns {Promise<Point[]>} 返回一个Promise对象，resolve的值是一个数组，数组的每个元素是一个对象，对象的属性包括
   */
  async function getMapPoints() {
    // 从服务器获取数据
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/map/point?tid=${tid}`);
    const data = await res.json();
    if (data.csq !== 1) return [];
    return data.point;
  }

  /**
   * @typedef {{ id: number, point: [number, number], direction: 1|0, speed: number, gait: number, radar: string }} Line
   * @returns {Promise<Line[]>} 返回一个Promise对象，resolve的值是一个数组，数组的每个元素是一个对象，对象的属性包括
   */
  async function getMapLines() {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/map/line?tid=${tid}`);
    const data = await res.json();
    if (data.csq !== 1) return [];
    return data.line;
  }

  /**
   *
   * @param {string} peri_id
   * @returns {{peri_id: string, point: number, path: number[]}}
   */
  async function getNavigationPlan(peri_id) {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/navigation/plan`, {
      method: "POST",
      body: { tid, peri_id: peri_id },
    });
    const data = await res.json();
    if (data.csq !== 1) return {};
    return { peri_id: data.peri_id, point: data.point, path: data.path };
  }

  /**
   * @returns {{ws: WebSocket, onData: ((this: WebSocket, ev: MessageEvent<any>) => any) | null }} 返回一个WebSocket对象，用于获取机器人状态
   */
  function createRobotStatusSocket() {
    const robotStatusSocket = new WebSocket(
      `${WS_SERVER_HOST}/patro/map/point?tid=${tid}`
    );
    robotStatusSocket.onopen = () => {
      console.log("ws opened");
    };
    robotStatusSocket.onmessage = (event) => {
      console.log(event.data);
    };
    return {
      ws: robotStatusSocket,
      onData: (cb) => {
        robotStatusSocket.onmessage = cb;
      },
    };
  }

  return {
    getMapPoints,
    getMapLines,
    getNavigationPlan,
    createRobotStatusSocket,
  };
};
