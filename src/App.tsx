import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { FenceData, LineData, PointData, genMapDataFetcher } from "./apis";
import {
  Coordinates,
  FastMap,
  Fence,
  Road,
  Robot,
  WayPoint,
} from "./components/map";
import {
  TaskAssignModal,
  TaskAssignModalRef,
} from "./components/TaskAssignModal";
import { StatusBar } from "./components/StatusBar";
import { Button, message } from "antd";
import {
  TaskCancelModal,
  TaskCancelModalRef,
} from "./components/TaskCancelModal";

const SCALE = 0.01;

function App() {
  const fastMapRef = useRef<FastMap>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const taskCancelModal = useRef<TaskCancelModalRef>(null);
  const taskAssignModal = useRef<TaskAssignModalRef>(null);

  const [debug, setDebug] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<[number, number]>([
    0, 0,
  ]);

  const [mapData, setMapData] = useState<
    | {
        fences: FenceData[] | undefined;
        lines: LineData[] | undefined;
        points: PointData[] | undefined;
      }
    | undefined
  >();

  const mapDataFetcher = useMemo(() => {
    return genMapDataFetcher("123");
  }, []);

  useEffect(() => {
    Promise.all([
      mapDataFetcher.getMapFences(),
      mapDataFetcher.getMapLines(),
      mapDataFetcher.getMapPoints(),
    ]).then(([fences, lines, points]) => {
      setMapData({ fences, lines, points });
    });
  }, [mapDataFetcher]);

  const init = useCallback(() => {
    if (!mapData) return;
    if (fastMapRef.current) {
      fastMapRef.current.canvas.dispose();
      // @ts-expect-error 无需关注
      fastMapRef.current = null;
    }

    // 创建一个FastMap实例
    // @ts-expect-error 无需关注
    fastMapRef.current = new FastMap(
      // 这里是一个canvas的id，通过html中 <canvas id="canvas"></canvas> 创建的canvas
      "canvas",
      // 这里是配置项，可参考fabric.Canvas#constructor的配置项
      {
        selection: false,
        backgroundColor: "#f0f0f0",
        // 这里是FastMap扩展的配置项，可以配置不同的图形的样式
        fastMapConfig: {
          scale: { x: SCALE, y: SCALE },
          draw: {
            initOffset: [1200, 50],
            Fence: ({ type }) => {
              return {
                zIndex: -100,
                fill: type === "boundary" ? "#a5d8ff" : "#f0f0f0",
              };
            },
            // 如有相同的参数定义，gait > speed > mode
            Road: ({ mode, gait }) => {
              const strokeWidth = mode === "one-way" ? 1 : 2;
              // const stroke =
              //   speed === 1 ? "#40c057" : speed === 3 ? "#fa5252" : "#fd7e14";
              const strokeDashArray =
                gait === "slope" ? [1, 1] : gait === "stairs" ? [5, 5] : [];
              return { stroke: "#1c7ed6", strokeWidth, strokeDashArray };
            },
            WayPoint: ({ type }) => {
              // const stroke =
              //   type === "charge"
              //     ? "#40c057"
              //     : type === "chargePrepare"
              //     ? "#8ce99a"
              //     : type === "return"
              //     ? "#7048e8"
              //     : type === "task"
              //     ? "#1c7ed6"
              //     : undefined;

              return {
                radius: 6,
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
      }
    );
    // 把FastMap实例保存到ref中
    const fastMap = fastMapRef.current;

    fastMap.debug = debug;

    fastMap.handleMove((e) => {
      const pointer = fastMap.getCoordinates(e);
      setCursorPosition([pointer.x, pointer.y]);
    });

    fastMap.handleIndicate((data) => {
      taskAssignModal.current?.show({
        fastMap,
        x: data.x,
        y: data.y,
        angle: data.angle,
        waypointKey: data.waypointKey,
      });
    });

    // 添加围栏
    for (const f of mapData.fences || []) {
      const fence = new Fence({
        fastMap,
        // 这里的key是唯一标识，不可重复
        key: f.id,
        // 这里的points是围栏的点位，是一个FastMap.Coordinates实例数组
        polygon: f.points.map((p) => new Coordinates(p[0], p[1], 0)),
        // 这里的type是围栏的类型，是一个字符串，可选值有"boundary"、"obstacle"，表示边界和障碍物
        type: f.type === 0 ? "boundary" : "obstacle",
      });
      fastMap.addFences([fence]);
    }

    // 添加点位
    for (const point of mapData.points || []) {
      const waypoint = new WayPoint({
        fastMap,
        // 这里的key是唯一标识，不可重复
        key: point.id,
        // 这里的center是点位的中心点，是一个FastMap.Coordinates实例
        center: new Coordinates(point.pos[0], point.pos[1], 0),
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
    for (const line of mapData.lines || []) {
      const road = new Road({
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
          line.radar === "红"
            ? "red"
            : line.radar === "黄"
            ? "yellow"
            : "white",
      });
      fastMap.addRoads([road]);
    }

    // 地图初始化
    fastMap.initiate();

    const robotStatusSocket = mapDataFetcher.createRobotStatusSocket();
    // 监听机器人状态信息
    robotStatusSocket.onData((e) => {
      const data = JSON.parse(e.data) as {
        msg: string;
        peri_id: string;
        status: { pos: number[]; yaw: number };
      };
      const robot = fastMap.shapes.robots.find((r) => r.key === data.peri_id);
      if (!robot) {
        fastMap.addRobot(
          new Robot({
            fastMap: fastMap,
            key: data.peri_id,
            center: new Coordinates(
              data.status.pos[0],
              data.status.pos[1],
              data.status.pos[2] || 0
            ),
            angle: data.status.yaw * (180 / Math.PI),
          })
        );
      } else {
        fastMap.setRobotTo(
          data.peri_id,
          new Coordinates(
            data.status.pos[0],
            data.status.pos[1],
            data.status.pos[2]
          ),
          data.status.yaw * (180 / Math.PI)
        );
      }
    });
  }, [debug, mapData, mapDataFetcher]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    // 初始化时调整canvas大小
    resizeCanvas();

    // 监听窗口大小变化，以便重新调整canvas大小
    window.addEventListener("resize", resizeCanvas);

    // 组件卸载时移除事件监听器
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <>
      <canvas
        id="canvas"
        ref={canvasRef}
        style={{ height: "100vh", width: "100vw" }}
      ></canvas>
      <StatusBar
        info={{
          cursorPosition,
        }}
        leftExtra={[
          <Button
            key="add-robot"
            size="small"
            onClick={() => {
              if (!fastMapRef.current) return;
              if (fastMapRef.current.shapes.robots?.[0]) return;
              fastMapRef.current.addRobot(
                new Robot({
                  fastMap: fastMapRef.current,
                  key: "robot1",
                  center: new Coordinates(0, 0, 0),
                })
              );
            }}
          >
            添加测试机器人
          </Button>,
          <Button
            key="change-robot"
            size="small"
            onClick={() => {
              if (!fastMapRef.current) return;
              const robot = fastMapRef.current.shapes.robots?.[0];
              fastMapRef.current.setRobotTo(
                "robot1",
                new Coordinates(robot.center.x + 10, robot.center.y, 0),
                robot.angle + 10
              );
            }}
          >
            模拟机器人位置变更
          </Button>,
        ]}
        onCheckedShowPoint={(visible) => {
          if (!fastMapRef.current) return;
          setDebug(visible);
        }}
        onClickAssignTask={() => {
          if (!fastMapRef.current) return;
          if (!fastMapRef.current.shapes.robots?.[0]) {
            message.error("请先添加机器人");
            return;
          }
          fastMapRef.current.mode = "assign";
          fastMapRef.current.canvas.defaultCursor = "crosshair";
        }}
        onClickCancelTask={() => {
          if (!fastMapRef.current) return;
          taskCancelModal.current?.show({ fastMap: fastMapRef.current });
        }}
      />
      <TaskAssignModal
        ref={taskAssignModal}
        onOk={async (e) => {
          if (!fastMapRef.current) return;
          fastMapRef.current.canvas.defaultCursor = "default";
          if (!e.waypointKey && e.waypointKey !== 0) {
            message.error("请选择点位");
            return;
          }
          const res = await mapDataFetcher.navigationPlan(
            e.fastMap.shapes.robots[0].key,
            !e.waypointKey && e.waypointKey !== 0
              ? [e.x, e.y, 0]
              : e.waypointKey
          );
          if (res.code === 0) {
            message.success("下发成功");
            fastMapRef.current.clearNavigation(1);
            fastMapRef.current?.navigation(
              1,
              res.path.map((r) => {
                if (Array.isArray(r)) {
                  return [r[0], r[1], 0];
                }
                return r;
              })
            );
          } else {
            message.error("下发失败");
          }
        }}
        onCancel={() => {
          if (!fastMapRef.current) return;
          fastMapRef.current.canvas.defaultCursor = "default";
        }}
      />
      <TaskCancelModal
        ref={taskCancelModal}
        onOk={async ({ fastMap }) => {
          const res = await mapDataFetcher.navigationStop(
            fastMap.shapes.robots[0].key
          );
          if (res.code === 0) {
            message.success("取消成功");
            fastMap.clearNavigation(1);
          } else {
            message.error("取消失败");
          }
        }}
        onCancel={() => {}}
      />
    </>
  );
}

export default App;
