// electronReload.js
/**
 * 开发环境热重载配置
 * 监听文件变化，自动重新加载应用
 */

const path = require('path');
const { app } = require('electron');
const electronReload = require('electron-reload');

const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
  // 设置需要监视的文件和目录
  const watchPaths = [
    path.join(__dirname, '../dist/main'),
    path.join(__dirname, '../dist/renderer'),
    path.join(__dirname, '../src/main'),
  ];

  // 配置热重载
  electronReload(watchPaths, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
    forceHardReset: false,
    // 主进程变化时重新启动整个应用
    // 渲染进程变化由 Next.js 的热重载处理
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  console.log('Development hot reload enabled');
}
