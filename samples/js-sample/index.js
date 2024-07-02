// 取得转换后的数据，这个数据的结构和api数据结构一致
const { lines, points } = fetchData();
console.log("🚀 ~ points:", points);
console.log("🚀 ~ lines:", lines);

// --------------------------------------------------
// 以下为正式的demo代码
// --------------------------------------------------

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
          const stroke = speed === 1 ? "green" : speed === 2 ? "orange" : "red";
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
        line.radar === "红" ? "red" : line.radar === "黄" ? "yellow" : "white",
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

// 这里是模拟维护多个机器人，通过定时任务触发，定时任务中会让每个机器人按照原有位置随机移动一定距离
const robotKeys = [];
setInterval(() => {
  robotKeys.map((key) => {
    // 取一个介于bound.x1和bound.x2中的随机数
    const x = -0.5 + Math.random();
    const y = -0.5 + Math.random();
    const robot = fastMap.shapes.robots.find((r) => r.key === key);
    if (!robot) return;

    // 移动机器人，这里接入了websocket后，就可以通过这个方法来实时更新机器人的位置
    fastMap.moveRobotTo(
      key,
      new FastMap.Coordinates(robot.center.x + x * 4, robot.center.y + y * 4, 0)
    );
  });
}, 100);

// 这里是模拟添加机器人，通过按钮触发
const addRobotButton = document.getElementById("add-robot");
if (addRobotButton) {
  addRobotButton.onclick = () => {
    const key = `test-${robotKeys.length + 1}`;
    robotKeys.push(key);
    const bound = fastMap.getMapBound();
    // 取一个介于bound.x1和bound.x2中的随机数
    const x = bound.x1 + Math.random() * (bound.x2 - bound.x1);
    const y = bound.y1 + Math.random() * (bound.y2 - bound.y1);
    // 添加机器人，这里接入了websocket后，就可以通过这个方法来实时添加新的机器人
    fastMap.addRobot(
      new FastMap.Robot({
        key,
        center: new FastMap.Coordinates(x, y, 0),
      })
    );
  };
}

// 这里是模拟高亮，随机挑一些点位和路径和机器人高亮，通过按钮触发，这个高亮可以用于显示机器人的路径规划
const highlightButton = document.getElementById("highlight");
if (highlightButton) {
  highlightButton.onclick = () => {
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomRobot = random(fastMap.shapes.robots);
    const randomRoad = random(fastMap.shapes.roads);
    const randomWayPoint = random(fastMap.shapes.waypoints);
    const highlights = new FastMap.Highlights({
      fastMap: fastMap,
      robotKeys: [randomRobot?.key],
      roadKeys: [randomRoad?.key],
      waypointKeys: [randomWayPoint?.key],
      // 机器人的高亮样式，变大+红色
      robotRectOptions: { height: 14, width: 14, fill: "red" },
      // 路径的高亮样式，加粗线
      roadOptions: { strokeWidth: 10 },
      // 点位的高亮样式，半径加大
      waypointOptions: { radius: 10 },
    });
    fastMap.highlight(highlights);
  };
}

// 这里是清除高亮
const clearHighlightButton = document.getElementById("clear-highlight");
if (clearHighlightButton) {
  clearHighlightButton.onclick = () => {
    fastMap.clearHighlight();
  };
}

// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
// 以下代码仅用于临时的数据转换，就是把excel的内容拷贝出来转换成api数据的格式，不需要关注
// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------

/**
 * 这个方法仅本地sample使用，用来把excel里拷贝出来的文本转换成实际api里应答的数据结构
 * @returns
 */
function fetchData() {
  /**
   * @params {string} text - 从文件中读取的原始文本，这个文本是直接从excel里拷贝出来的
   * @returns {Array} - 返回一个数组，数组中的每个元素是一个对象，对象的key是表头的名称，value是对应的值
   */
  const raw2arr = (text) => {
    const rows = text.split("\n");
    const header = rows[1].split("\t");
    const body = rows.slice(2).map((row) => row.split("\t"));
    return body.map((row) => {
      return header.reduce((acc, key, index) => {
        acc[key] = row[index];
        return acc;
      }, {});
    });
  };

  const arr = raw2arr(`
计数	名称	半径	标题	关键字	厚度	线宽	线型	颜色	差值 X	差值 Y	差值 Z	端点 X	端点 Y	端点 Z	角度	起点 X	起点 Y	起点 Z	长度	中心 X	中心 Y	中心 Z
1	直线				1.0000	0.70 毫米	ByLayer	红	0.7450	1.5517	0.0000	21.3550	2.4977	0.0000	64	20.6100	0.9460	0.0000	1.7213			
1	直线				1.0000	0.00 毫米	ByLayer	ByLayer	0.3360	0.6110	0.0000	20.6100	0.9460	0.0000	61	20.2740	0.3350	0.0000	0.6973			
1	直线				1.0000	0.00 毫米	ByBlock	ByLayer	0.6300	0.4780	0.0000	20.2740	0.3350	0.0000	37	19.6440	-0.1430	0.0000	0.7908			
1	直线				0.0000	0.00 毫米	ByLayer	ByLayer	0.2917	0.8931	0.0000	21.8838	6.3703	0.0000	72	21.5921	5.4771	0.0000	0.9396			
1	直线				0.0000	0.00 毫米	ByLayer	ByLayer	0.2807	2.3425	0.0000	21.5921	5.4771	0.0000	83	21.3114	3.1347	0.0000	2.3592			
1	直线				1.0000	0.70 毫米	ByLayer	红	-0.0435	0.6369	0.0000	21.3114	3.1347	0.0000	94	21.3550	2.4977	0.0000	0.6384			
1	直线				1.0000	0.70 毫米	ByLayer	红	2.6686	0.0399	0.0000	14.4442	-0.2296	0.0000	1	11.7756	-0.2696	0.0000	2.6689			
1	直线				1.0000	0.70 毫米	ByLayer	红	3.1143	0.1608	0.0000	11.7756	-0.2696	0.0000	3	8.6612	-0.4303	0.0000	3.1185			
1	直线				1.0000	0.70 毫米	ByLayer	红	3.3019	-0.4382	0.0000	8.6612	-0.4303	0.0000	352	5.3593	0.0079	0.0000	3.3309			
1	直线				1.0000	0.00 毫米	ByBlock	ByLayer	0.6570	0.3550	0.0000	19.6440	-0.1430	0.0000	28	18.9870	-0.4980	0.0000	0.7468			
1	直线				0.0000	0.00 毫米	ByLayer	ByLayer	3.3406	-0.2187	0.0000	18.9870	-0.4980	0.0000	356	15.6464	-0.2793	0.0000	3.3477			
1	直线				3.0000	0.00 毫米	ByLayer	ByLayer	1.2022	-0.0496	0.0000	15.6464	-0.2793	0.0000	358	14.4442	-0.2296	0.0000	1.2032			
1	直线				0.0000	0.00 毫米	ByLayer	ByLayer	0.7014	2.1887	0.0000	21.3114	3.1347	0.0000	72	20.6100	0.9460	0.0000	2.2983			
1	圆	0.0500			1.0000	0.00 毫米	ByLayer	绿												19.5050	-0.4980	0.0000
1	直线				1.0000	0.70 毫米	ByLayer	红	0.5180	0.0000	0.0000	19.5050	-0.4980	0.0000	0	18.9870	-0.4980	0.0000	0.5180			
1	直线				0.0000	0.00 毫米	ByLayer	ByLayer	6.4163	-0.2774	0.0000	11.7756	-0.2696	0.0000	358	5.3593	0.0079	0.0000	6.4223			
1	直线				3.0000	0.00 毫米	ByLayer	黄	9.0849	-0.2375	0.0000	14.4442	-0.2296	0.0000	359	5.3593	0.0079	0.0000	9.0880			
1	直线				3.0000	0.00 毫米	ByLayer	黄	0.5724	3.2356	0.0000	21.8838	6.3703	0.0000	80	21.3114	3.1347	0.0000	3.2858			
1	圆	0.0500			0.0000	0.50 毫米	ByLayer	ByLayer												8.6612	-0.4303	0.0000
1	圆	0.0500			0.0000	0.50 毫米	ByLayer	ByLayer												5.3593	0.0079	0.0000
1	圆	0.0500			1.0000	0.00 毫米	ByLayer	绿												21.8838	6.3703	0.0000
1	圆	0.0500			0.0000	0.50 毫米	ByLayer	ByLayer												21.3550	2.4977	0.0000
1	圆	0.0500			0.0000	0.50 毫米	ByLayer	ByLayer												21.5921	5.4771	0.0000
1	圆	0.0500			0.0000	0.50 毫米	ByLayer	ByLayer												11.7756	-0.2696	0.0000
`);

  const points = arr
    .filter((item) => item.名称 === "圆")
    .map((item) => ({
      id: `circle-${item["中心 X"]}-${item["中心 Y"]}-${item["中心 Z"]}`,
      name: `circle-${item["中心 X"]}-${item["中心 Y"]}-${item["中心 Z"]}`,
      pos: [
        Number(item["中心 X"]) * 50,
        Number(item["中心 Y"]) * 50,
        Number(item["中心 Z"]) * 50,
      ],
      // 文档里只给到了掉头点、充电点、任务点。但是给到的api文档中是过渡点、任务点、充电准备点、充电点
      type: item.颜色 === "绿" ? 3 : item.厚度 === "1.0000" ? 0 : 1,
    }));

  const getPointId = (lineItem) => {
    const x1 = Number(lineItem["起点 X"]) * 50;
    const y1 = Number(lineItem["起点 Y"]) * 50;
    const x2 = Number(lineItem["端点 X"]) * 50;
    const y2 = Number(lineItem["端点 Y"]) * 50;
    const point1 = points.find(
      (item) => item.pos[0] === x1 && item.pos[1] === y1
    );
    let pointId1 = point1?.id;
    if (!point1) {
      console.error("找不到起点", lineItem, point1);
      // 找不到起点的，直接创建个新节点
      points.push({
        id: `point-${x1}-${y1}-0`,
        name: `point-${x1}-${y1}-0`,
        pos: [x1, y1, 0],
        type: 0,
      });
      pointId1 = `point-${x1}-${y1}-0`;
    }
    const point2 = points.find(
      (item) => item.pos[0] === x2 && item.pos[1] === y2
    );
    let pointId2 = point2?.id;
    if (!point2) {
      console.error("找不到终点", lineItem, point2);
      // 找不到终点的，直接创建个新节点
      points.push({
        id: `point-${x2}-${y2}-0`,
        name: `point-${x2}-${y2}-0`,
        pos: [x2, y2, 0],
        type: 0,
      });
      pointId2 = `point-${x2}-${y2}-0`;
    }
    return [pointId1, pointId2];
  };

  const lines = arr
    .filter((item) => item.名称 === "直线")
    .map((item) => ({
      id: `line-${item["起点 X"]}-${item["起点 Y"]}-${item["起点 Z"]}-${item["端点 X"]}-${item["端点 Y"]}-${item["端点 Z"]}`,
      name: `line-${item["起点 X"]}-${item["起点 Y"]}-${item["起点 Z"]}-${item["端点 X"]}-${item["端点 Y"]}-${item["端点 Z"]}`,
      // 路径的点位是参考地图点位的
      point: getPointId(item),
      speed: item.厚度 === "1.0000" ? 1 : item.厚度 === "3.0000" ? 3 : 2,
      gait: item.线型 === "ByLayer" ? 0 : item.线型 === "ByBlock" ? 1 : 2,
      radar: item.颜色 === "红" ? "红" : item.颜色 === "黄" ? "黄" : "白",
    }));
  return { points, lines };
}
