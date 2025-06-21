import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';
import { createMenu } from './menu';

// 全局保存对主窗口的引用
let mainWindow: BrowserWindow | null = null;

// 确保只有一个应用实例运行
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 当运行第二个实例时，如果主窗口存在，则聚焦到主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// 准备并启动应用
async function createWindow() {
  // 首先准备Next.js
  await prepareNext('./src/renderer');

  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? join(__dirname, '../../dist/main/preload.js')
        : join(__dirname, 'preload.js'),
    },
    // 暂时移除图标，稍后添加
    // icon: join(app.getAppPath(), 'assets', 'icons', 'icon.png'),
  });

  // 创建应用菜单
  createMenu(mainWindow);

  // 加载应用
  const url = isDev
    ? 'http://localhost:3000'
    : `file://${join(__dirname, '../renderer/out/index.html')}`;

  await mainWindow.loadURL(url);

  // 在开发环境打开开发者工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 当窗口关闭时清除引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当Electron完成初始化后创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上保持应用运行，直到用户使用Cmd+Q退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // 在macOS上，当点击dock图标且没有其他窗口打开时，重新创建一个窗口
  if (mainWindow === null) {
    await createWindow();
  }
});

// IPC通信处理
// 这里将添加处理来自渲染进程的消息的代码
