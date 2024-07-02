// 引入Hapi模块
const mock = require("./data");
const Hapi = require("@hapi/hapi");

// 创建一个异步函数来启动服务器
const init = async () => {
  // 创建服务器实例
  const server = Hapi.server({
    port: 3000, // 服务器监听的端口
    host: "localhost", // 服务器的主机名
    routes: {
      cors: true,
    },
  });

  server.route({
    method: "GET",
    path: "/", // 访问路径
    handler: (request, h) => {
      return "Hello, World!";
    },
  });

  server.route({
    method: "GET",
    path: "/patro/map/line",
    handler: () => {
      return { csq: 1, line: mock.lines };
    },
  });

  server.route({
    method: "GET",
    path: "/patro/map/point",
    handler: () => {
      return { csq: 1, point: mock.points };
    },
  });

  server.route({
    method: "POST",
    path: "/patro/navigation/plan",
    handler: (request) => {
      // 随机取一组path
      const path = mock.lines.filter(() => Math.random() > 0.5);
      // 随机取一个point
      const point = mock.points[Math.floor(Math.random() * mock.points.length)];
      return {
        csq: 1,
        peri_id: request.payload.peri_id,
        point: point.id,
        path: path.map((p) => p.id),
      };
    },
  });

  // 启动服务器
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

// 处理启动过程中可能出现的错误
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

// 调用初始化函数
init();
