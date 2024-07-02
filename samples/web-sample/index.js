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
            const strokeWidth = mode === "one-way" ? 3 : 2;
            const stroke =
              speed === 1 ? "green" : speed === 2 ? "orange" : "red";
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

            return { fill, strokeWidth: 2 };
          },
          Robot: () => ({
            height: 10,
            width: 10,
          }),
        },
      },
    }
  );

  // 添加路径
  for (const line of lines) {
    fastMap.addRoads([
      new FastMap.Road({
        // 这里的key是唯一标识，不可重复
        key: line.id,
        // 这里的begin和end是路径的起点和终点，是一个FastMap.Coordinates实例或者FastMap.WayPoint的id
        begin: line.point[0],
        end: line.point[1],
        // 这里的mode是路径的类型，是一个字符串，可选值有"one-way"和"two-way"，表示单向和双向
        mode: line.direction === 1 ? "two-way" : "one-way",
        // 这里的speed是路径的速度，是一个数字，可选值有1、2、3，表示慢、中、快
        speed: line.speed === 1 ? 1 : line.speed === 2 ? 3 : 2,
        // 这里的gait是路径的坡度，是一个字符串，可选值有"stairs"、"slope"、"flat"，表示楼梯、坡道、平地
        gait: line.gait === 1 ? "stairs" : line.gait === 2 ? "slope" : "flat",
        // 这里的radar是路径的雷达颜色，是一个字符串，可选值有"red"、"yellow"、"white"，表示红、黄、白
        radar:
          line.radar === "红"
            ? "red"
            : line.radar === "黄"
            ? "yellow"
            : "white",
      }),
    ]);
  }

  // 添加点位
  for (const point of points) {
    fastMap.addWaypoints([
      new FastMap.WayPoint({
        // 这里的key是唯一标识，不可重复
        key: point.id,
        // 这里的center是点位的中心点，是一个FastMap.Coordinates实例
        center: new FastMap.Coordinates(point.pos[0], point.pos[1], 0),
        // 这里的type是点位的类型，是一个字符串，可选值有"charge"、"task"、"return"，表示充电点、任务点、掉头点
        type:
          point.type === 3
            ? "charge"
            : point.type === 2
            ? "chargePrepare"
            : point.type === 1
            ? "task"
            : "return",
      }),
    ]);
  }

  // 地图初始化
  fastMap.initiate();

  return fastMap;
}

init().then((fastMap) => {
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
            data.status.pos[2]
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
  // 定时更新路径规划
  setInterval(async () => {
    const robotKeys = fastMap.shapes.robots.map((r) => r.key);
    const highlightPointList = [];
    const highlightLineList = [];
    for (const robotKey of robotKeys) {
      const plan = await mapDataFetcher.getNavigationPlan(robotKey);
      if (plan) {
        highlightPointList.push(plan.point);
        highlightLineList.push(...plan.path);
      }
    }

    // 除了取得的路径和点位外，还需要把路径经过的点位也高亮一下
    const points = fastMap.shapes.roads.filter((r) =>
      highlightLineList.includes(r.key)
    );
    for (const point of points) {
      highlightPointList.push(point.begin, point.end);
    }

    const highlights = new FastMap.Highlights({
      fastMap,
      robotKeys: [],
      roadKeys: highlightLineList,
      waypointKeys: highlightPointList,
      // 机器人的高亮样式，变大+红色
      robotRectOptions: { height: 14, width: 14, fill: "red" },
      // 路径的高亮样式，加粗线
      roadOptions: { strokeWidth: 10 },
      // 点位的高亮样式，半径加大
      waypointOptions: { radius: 10 },
    });
    fastMap.highlight(highlights);
  }, 3000);
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
