const HTTP_SEVER_HOST = "http://122.224.165.90:39014";
const WS_SERVER_HOST = "ws://localhost:3001";

const search = window.location.search;
const tid = search.slice(0).split("=")[1];

const mapDataFetcher = genMapDataFetcher(tid);

// --------------------------------------------------
// 以下为正式的demo代码
// --------------------------------------------------

async function init() {
  const [lines, points] = await Promise.all([
    mapDataFetcher.getMapLines(),
    mapDataFetcher.getMapPoints(),
  ]);
  // 创建一个FastMap实例
  const fastMap = new FastMap(
    // 这里是一个canvas的id，通过html中 <canvas id="canvas"></canvas> 创建的canvas
    "canvas",
    // 这里是配置项，可参考fabric.Canvas#constructor的配置项
    {
      selection: false,
      backgroundColor: "#f0f0f0",
      // 这里是FastMap扩展的配置项，可以配置不同的图形的样式
      fastMapConfig: {
        draw: {
          // 如有相同的参数定义，gait > speed > mode
          Road: ({ mode, speed, gait }) => {
            const strokeWidth = mode === "one-way" ? 3 : 10;
            const stroke =
              speed === 1 ? "green" : speed === 3 ? "red" : "orange";
            const strokeDashArray =
              gait === "slope" ? [1, 1] : gait === "stairs" ? [5, 5] : [];
            return { stroke, strokeWidth, strokeDashArray };
          },
          WayPoint: ({ type }) => {
            const fill =
              type === "charge"
                ? "green"
                : type === "chargePrepare"
                ? "lightGreen"
                : type === "return"
                ? "purple"
                : type === "task"
                ? "blue"
                : undefined;

            return { radius: 5, fill, strokeWidth: 2 };
          },
          Robot: () => ({
            height: 10,
            width: 10,
          }),
        },
      },
    }
  );

  // 添加点位
  for (const point of points) {
    const waypoint = new FastMap.WayPoint({
      fastMap,
      // 这里的key是唯一标识，不可重复
      key: point.id,
      // 这里的center是点位的中心点，是一个FastMap.Coordinates实例
      center: new FastMap.Coordinates(point.pos[0], point.pos[1], 0, 0.01),
      // 这里的type是点位的类型，是一个字符串，可选值有"charge"、"task"、"return"，表示充电点、任务点、掉头点
      type:
        point.type === 3
          ? "charge"
          : point.type === 2
          ? "chargePrepare"
          : point.type === 1
          ? "task"
          : "return",
    });
    fastMap.addWaypoints([waypoint]);
  }

  // 添加路径
  for (const line of lines) {
    const road = new FastMap.Road({
      fastMap,
      // 这里的key是唯一标识，不可重复
      key: line.id,
      // 这里的begin和end是路径的起点和终点，是一个FastMap.Coordinates实例或者FastMap.WayPoint的id
      begin: line.point[0],
      end: line.point[1],
      // 这里的mode是路径的类型，是一个字符串，可选值有"one-way"和"two-way"，表示单向和双向
      mode: line.direction === 1 ? "two-way" : "one-way",
      speed: line.speed,
      // 这里的gait是路径的坡度，是一个字符串，可选值有"stairs"、"slope"、"flat"，表示楼梯、坡道、平地
      gait: line.gait === 1 ? "stairs" : line.gait === 2 ? "slope" : "flat",
      // 这里的radar是路径的雷达颜色，是一个字符串，可选值有"red"、"yellow"、"white"，表示红、黄、白
      radar:
        line.radar === "红" ? "red" : line.radar === "黄" ? "yellow" : "white",
    });
    fastMap.addRoads([road]);
  }

  // 地图初始化
  fastMap.initiate();

  return fastMap;
}
init().then((fastMap) => {
  // const robotStatusSocket = mapDataFetcher.createRobotStatusSocket();
  // // 监听机器人状态信息
  // robotStatusSocket.onData((e) => {
  //   const data = JSON.parse(e.data);
  //   const robot = fastMap.shapes.robots.find((r) => r.key === data.peri_id);
  //   if (!robot) {
  //     fastMap.addRobot(
  //       new FastMap.Robot({
  //         key: data.peri_id,
  //         center: new FastMap.Coordinates(
  //           data.status.pos[0],
  //           data.status.pos[1],
  //           data.status.pos[2] || 0
  //         ),
  //       })
  //     );
  //   } else {
  //     fastMap.moveRobotTo(
  //       data.peri_id,
  //       new FastMap.Coordinates(
  //         data.status.pos[0],
  //         data.status.pos[1],
  //         data.status.pos[2]
  //       )
  //     );
  //   }
  // });
  // // 定时更新路径规划
  // setInterval(async () => {
  //   const robotKeys = fastMap.shapes.robots.map((r) => r.key);
  //   const highlightPointList = [];
  //   const highlightLineList = [];
  //   for (const robotKey of robotKeys) {
  //     const plan = await mapDataFetcher.getNavigationPlan(robotKey);
  //     if (plan) {
  //       highlightPointList.push(plan.point);
  //       highlightLineList.push(...plan.path);
  //     }
  //   }
  //   // 除了取得的路径和点位外，还需要把路径经过的点位也高亮一下
  //   const points = fastMap.shapes.roads.filter((r) =>
  //     highlightLineList.includes(r.key)
  //   );
  //   for (const point of points) {
  //     highlightPointList.push(point.begin, point.end);
  //   }
  //   const highlights = new FastMap.Highlights({
  //     fastMap,
  //     robotKeys: [],
  //     roadKeys: highlightLineList,
  //     waypointKeys: highlightPointList,
  //     // 机器人的高亮样式，变大+红色
  //     robotRectOptions: { height: 14, width: 14, fill: "red" },
  //     // 路径的高亮样式，加粗线
  //     roadOptions: { strokeWidth: 10 },
  //     // 点位的高亮样式，半径加大
  //     waypointOptions: { radius: 10 },
  //   });
  //   fastMap.highlight(highlights);
  // }, 3000);
});

function resizeCanvas() {
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
// 在页面加载时调整 canvas 大小
window.onload = resizeCanvas;
// 当窗口大小改变时，重新调整 canvas 大小
window.onresize = resizeCanvas;

function genMapDataFetcher(tid) {
  /**
   * @typedef {{ id: number, name: string, pos: [number,number,number], type: number }} Point
   * @returns {Promise<Point[]>} 返回一个Promise对象，resolve的值是一个数组，数组的每个元素是一个对象，对象的属性包括
   */
  async function getMapPoints() {
    // 从服务器获取数据
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/map/point?tid=${tid}`);
    const data = await res.json();
    // if (data.csq !== 1) return [];
    return data.point;
  }

  /**
   * @typedef {{ id: number, point: [number, number], direction: 1|0, speed: number, gait: number, radar: string }} Line
   * @returns {Promise<Line[]>} 返回一个Promise对象，resolve的值是一个数组，数组的每个元素是一个对象，对象的属性包括
   */
  async function getMapLines() {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/map/line?tid=${tid}`);
    const data = await res.json();
    // if (data.csq !== 1) return [];
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
    // if (data.csq !== 1) return {};
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
}
