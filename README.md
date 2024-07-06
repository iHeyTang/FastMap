# FastMap

提供了一组 API 来用于渲染展示机器人路径和状态的地图

## 如何运行 demo

```bash
# 1. Clone 代码到本地
$ git clone https://github.com/iHeyTang/FastMap.git

# 2. 进入项目后，安装项目依赖
$ npm install

# 3. 编译
$ npm run build

# 4. 使用浏览器打开samples/js-sample/index.html, 推荐使用vscode 插件 open in browser
```

## Demo 介绍

Demo 中包含了 3 个按钮，分别是 Add Robot，Highlight，Clear Highlight

**Add Robot** 可以增加一个机器人渲染在地图上，这个是用来模拟调用方需要动态添加机器人的。添加机器人后，会发现机器人进行布朗运动，这是模拟调用方动态更新机器人位置的，它通过`setInterval`来调用对应的 api 实现

**Highlight** 可以高亮渲染节点，包括机器人，路径，点位。高亮格式可以通过 api 自行定义。高亮可以用来展示机器人规划路径，以及其他需要强调展示的需求。高亮可以通过实例来维护，这意味着你可以根据需求同时维护多种高亮模式，并在使用时直接传入对应的高亮实例即可。（目前只支持单一高亮实例，即同一时间只会有一个高亮实例生效）

**Clear Highlight** 可以清除高亮

## 如何使用

将编译好的文件放到项目中或放到 cdn 中，可以通过 cdn 的形式引入脚本，见`samples/js-sample/index.html`

引入后，`window`上将会挂载一个 FastMap 接口，可通过该接口进行地图的调用，如下：

```javascript
// 创建一个地图实例
const fastMap = new FastMap("canvas", { backgroundColor: "#f0f0f0" });

// 创建2个点位，并加入到地图实例中
const waypoint1 = new FastMap.WayPoint({
  key: "p-1",
  center: new FastMap.Coordinates(0, 0, 0),
  type: "charge",
});
const waypoint2 = new FastMap.WayPoint({
  key: "p-2",
  center: new FastMap.Coordinates(1, 1, 0),
  type: "task",
});
fastMap.addWaypoints([waypoint1, waypoint2]);

// 创建一个路径，并加入到地图实例中
const road = new FastMap.Road({
  key: "r-1",
  begin: "p-1",
  end: "p-2",
  mode: "two-way",
  speed: 3,
  gait: "flat",
  radar: "红",
});
fastMap.addRoads([road]);

// 地图初始化
fastMap.initiate();
```

更详细的例子可以查看`samples/js-sample/index.js`

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
