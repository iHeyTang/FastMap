const HTTP_SEVER_HOST = "http://122.224.165.90:39014";
const WS_SERVER_HOST = "ws://localhost:3001";

const search = window.location.search;
const tid = search.slice(0).split("=")[1];

const mapDataFetcher = genMapDataFetcher(tid);

const SCALE = 0.006;

// --------------------------------------------------
// 以下为正式的demo代码
// --------------------------------------------------

/**
 * 机器人分配任务的窗口，由画布点击事件触发
 */
const taskAssignModal = (e) => {
  const { cx, cy, fastMap } = e;
  const x = Number((cx / SCALE).toFixed(4));
  const y = Number((cy / SCALE).toFixed(4));

  // 渲染一个蒙版
  const mask = document.createElement("div");
  mask.id = "mask";
  mask.style.position = "absolute";
  mask.style.left = "0";
  mask.style.top = "0";
  mask.style.width = "100%";
  mask.style.height = "100%";
  mask.style.backgroundColor = "rgba(0,0,0,0.5)";
  mask.style.zIndex = 998;
  document.body.appendChild(mask);
  // 点击蒙版关闭窗口
  mask.onclick = () => {
    mask.remove();
  };

  //渲染一个div
  // if (document.getElementById("task-assign-modal")) return;
  const body = document.createElement("div");
  body.id = "modal";
  body.style.position = "absolute";
  body.style.left = "calc(50% - 200px)";
  body.style.top = "30%";
  body.style.width = "400px";
  body.style.height = "300px";
  body.style.backgroundColor = "white";
  body.style.zIndex = 999;
  body.style.padding = "20px";
  body.style.textAlign = "center";
  mask.appendChild(body);

  const title = document.createElement("div");
  title.append(document.createTextNode("派遣机器人"));
  title.style.textAlign = "center";
  title.style.fontSize = "20px";

  body.appendChild(title);
  body.appendChild(
    document.createTextNode(
      `坐标 (${x}, ${y})，请选择机器人派遣任务，或中止已有任务`
    )
  );
  body.onclick = (e) => {
    // body 点击事件阻止冒泡
    e.stopPropagation();
  };

  // 在body中渲染多个机器人
  for (const r of fastMap.shapes.robots) {
    const robot = document.createElement("div");

    robot.style.display = "flex";

    const robotDoTask = document.createElement("div");
    robotDoTask.style.color = "white";
    robotDoTask.style.backgroundColor = "gray";
    robotDoTask.style.cursor = "pointer";
    robotDoTask.style.textAlign = "center";
    robotDoTask.style.alignContent = "center";
    robotDoTask.style.height = "60px";
    robotDoTask.style.margin = "4px 4px";
    robotDoTask.style.padding = "4px 4px";
    robotDoTask.style.width = "100%";

    const robotTitle = document.createElement("div");
    robotTitle.appendChild(document.createTextNode(r.key));
    robotDoTask.appendChild(robotTitle);
    const robotPos = document.createElement("div");
    robotPos.appendChild(
      document.createTextNode(
        `(${(r.center.x / SCALE).toFixed(4)}, ${(r.center.y / SCALE).toFixed(
          4
        )})`
      )
    );
    robotDoTask.appendChild(robotPos);

    robotDoTask.onclick = () => {
      const res = mapDataFetcher.navigationPlan(r.key);
      if (res.csq === 1) {
        // 关闭窗口
        mask.remove();
        setTimeout(() => {
          // 轻提示
          alert(`任务派遣成功，机器人${r.key}已经开始前往(${x}, ${y})点位`);
          const highlights = new FastMap.Highlights({
            fastMap,
            robotKeys: [],
            roadKeys: res.path,
            waypointKeys: res.point,
            // 机器人的高亮样式，变大+红色
            robotRectOptions: { height: 14, width: 14, fill: "red" },
            // 路径的高亮样式，加粗线
            roadOptions: { strokeWidth: 10 },
            // 点位的高亮样式，半径加大
            waypointOptions: { radius: 10 },
          });
          fastMap.highlight(highlights);
        }, 0);
      } else {
        alert("任务派遣失败");
      }
    };

    const ending = document.createElement("div");
    ending.style.color = "white";
    ending.style.backgroundColor = "#f03e3e";
    ending.style.cursor = "pointer";
    ending.style.textAlign = "center";
    ending.style.alignContent = "center";
    ending.style.height = "60px";
    ending.style.margin = "4px 4px";
    ending.style.padding = "4px 4px";
    ending.style.width = "60px";
    ending.appendChild(document.createTextNode("中止"));

    ending.onclick = () => {
      const res = mapDataFetcher.navigationStop(r.key);
      if (res.csq === 1) {
        // 关闭窗口
        mask.remove();
        setTimeout(() => {
          // 轻提示
          alert("任务取消成功");
          fastMap.clearHighlight();
        }, 0);
      } else {
        alert("任务取消失败");
      }
    };

    robot.appendChild(robotDoTask);
    robot.appendChild(ending);

    body.appendChild(robot);
  }
};

async function init() {
  const [fences, lines, points] = await Promise.all([
    mapDataFetcher.getMapFences(),
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
          Fence: ({ type }) => {
            return {
              zIndex: -100,
              fill: type === "boundary" ? "#a5d8ff" : "#f0f0f0",
            };
          },
          // 如有相同的参数定义，gait > speed > mode
          Road: ({ mode, speed, gait }) => {
            const strokeWidth = mode === "one-way" ? 1 : 2;
            const stroke =
              speed === 1 ? "#40c057" : speed === 3 ? "#fa5252" : "#fd7e14";
            const strokeDashArray =
              gait === "slope" ? [1, 1] : gait === "stairs" ? [5, 5] : [];
            return { stroke: "#1c7ed6", strokeWidth, strokeDashArray };
          },
          WayPoint: ({ type }) => {
            const stroke =
              type === "charge"
                ? "#40c057"
                : type === "chargePrepare"
                ? "#8ce99a"
                : type === "return"
                ? "#7048e8"
                : type === "task"
                ? "#1c7ed6"
                : undefined;

            return {
              radius: 2,
              stroke: "black",
              fill: "black",
              strokeWidth: type === "return" ? 1 : 5,
            };
          },
          Robot: () => ({
            height: 10,
            width: 10,
          }),
        },
      },
      onFastMapDoubleClick: (e) => {
        const { cx, cy, fastMap } = e;
        taskAssignModal({ cx, cy, fastMap });
      },
    }
  );

  // 添加围栏
  for (const f of fences) {
    const fence = new FastMap.Fence({
      fastMap,
      // 这里的key是唯一标识，不可重复
      key: f.id,
      // 这里的points是围栏的点位，是一个FastMap.Coordinates实例数组
      polygon: f.points.map(
        (p) => new FastMap.Coordinates(p[0], p[1], 0, SCALE)
      ),
      // 这里的type是围栏的类型，是一个字符串，可选值有"boundary"、"obstacle"，表示边界和障碍物
      type: f.type === 0 ? "boundary" : "obstacle",
    });
    fastMap.addFences([fence]);
  }

  // 添加点位
  for (const point of points) {
    const waypoint = new FastMap.WayPoint({
      fastMap,
      // 这里的key是唯一标识，不可重复
      key: point.id,
      // 这里的center是点位的中心点，是一个FastMap.Coordinates实例
      center: new FastMap.Coordinates(point.pos[0], point.pos[1], 0, SCALE),
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

  window.debug = () => {
    fastMap.debug = true;
    fastMap.initiate();
    return "开启调试模式！";
  };

  return fastMap;
}
init().then((fastMap) => {
  fastMap.addRobot(
    new FastMap.Robot({
      key: "test1",
      center: new FastMap.Coordinates(10000, 2000, 0, SCALE),
    })
  );
  fastMap.addRobot(
    new FastMap.Robot({
      key: "test2",
      center: new FastMap.Coordinates(15000, 3000, 0, SCALE),
    })
  );

  const robotStatusSocket = mapDataFetcher.createRobotStatusSocket();
  // 监听机器人状态信息
  robotStatusSocket.onData((e) => {
    const data = JSON.parse(e.data);
    const robot = fastMap.shapes.robots.find((r) => r.key === data.peri_id);
    if (!robot) {
      fastMap.addRobot(
        new FastMap.Robot({
          key: data.peri_id,
          center: new FastMap.Coordinates(
            data.status.pos[0],
            data.status.pos[1],
            data.status.pos[2] || 0
          ),
        })
      );
    } else {
      fastMap.moveRobotTo(
        data.peri_id,
        new FastMap.Coordinates(
          data.status.pos[0],
          data.status.pos[1],
          data.status.pos[2]
        )
      );
    }
  });
});

function resizeCanvas() {
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
// 在页面加载时调整 canvas 大小
window.onload = resizeCanvas;

function genMapDataFetcher(tid) {
  /**
   * @typedef {{ id: number, points: [number, number][], type: 0|1 }} Fence
   * @returns {Promise<Fence[]>} 返回一个Promise对象，resolve的值是一个数组，数组的每个元素是一个对象，对象的属性包括
   */
  async function getMapFences() {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/map/fence?tid=${tid}`);
    const data = await res.json();
    return data.fence;
  }

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
  async function navigationPlan(peri_id) {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/navigation/plan`, {
      method: "POST",
      body: JSON.stringify({ tid, peri_id: peri_id }),
      json: true,
    });
    const data = await res.json();
    // if (data.csq !== 1) return {};
    return { peri_id: data.peri_id, point: data.point, path: data.path };
  }

  /**
   *
   * @param {string} peri_id
   * @returns {{peri_id: string, point: number, path: number[]}}
   */
  async function navigationStop(peri_id) {
    const res = await fetch(`${HTTP_SEVER_HOST}/patro/navigation/stop`, {
      method: "POST",
      body: JSON.stringify({ tid, peri_id: peri_id }),
      json: true,
    });
    const data = await res.json();
    return data;
  }

  /**
   * @returns {{ws: WebSocket, onData: ((this: WebSocket, ev: MessageEvent<any>) => any) | null }} 返回一个WebSocket对象，用于获取机器人状态
   */
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
      onData: (cb) => {
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
