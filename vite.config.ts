import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteMockServe } from "vite-plugin-mock";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteMockServe({
      // 启动和关闭 mock 功能的配置
      mockPath: "mock", // mock 文件所在目录
      enable: false, // 开发环境是否启用 mock 功能
    }),
  ],
  server: {
    proxy: {
      "/patro": {
        target: "http://122.224.165.90:39014",
        changeOrigin: true,
      },
    },
  },
});
