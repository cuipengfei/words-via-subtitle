import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import isDev from 'electron-is-dev';
import { registerIpcHandlers } from './ipc-handlers';
import { SubtitleParserService } from './services/subtitleParser';
import { DictionaryService } from './services/dictionaryService';
import { createMenu } from './menu';

// 全局保存对主窗口的引用
let mainWindow: BrowserWindow | null = null;

// 服务实例
let subtitleParser: SubtitleParserService;
let dictionaryService: DictionaryService;

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
  // 在开发模式下，我们假设 Next.js 开发服务器已经在运行

  // 初始化服务
  subtitleParser = new SubtitleParserService();
  dictionaryService = new DictionaryService();

  try {
    await dictionaryService.initialize();
    console.log('词典服务初始化成功');
  } catch (error) {
    console.error('词典服务初始化失败:', error);
  }

  // 注册IPC处理器
  registerIpcHandlers(subtitleParser, dictionaryService);

  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    show: false, // 先不显示，等加载完成后再显示
  });

  // 加载应用
  const loadURL = isDev
    ? 'http://localhost:3000'
    : url.format({
        pathname: path.join(__dirname, '../renderer/out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(loadURL);

  // 当页面加载完成后显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 创建应用菜单
  createMenu(mainWindow);

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
