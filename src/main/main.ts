import { app, BrowserWindow, protocol } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import isDev from 'electron-is-dev';
import { registerIpcHandlers } from './ipc-handlers';
import { SubtitleParserService } from './services/subtitleParser';
import { DictionaryService } from './services/dictionaryService';
import { createMenu } from './menu';

// 在应用启动前注册自定义协议方案
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'video-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true,
    },
  },
]);

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
      webSecurity: false, // 允许访问本地文件
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

// 注册自定义协议用于安全访问本地视频文件
function registerVideoProtocol() {
  console.log('正在注册 video-file 协议...');

  protocol.registerStreamProtocol('video-file', (request, callback) => {
    console.log('收到视频协议请求:', request.url);

    try {
      // 从 URL 中提取文件路径
      const filePath = decodeURIComponent(request.url.replace('video-file://', ''));
      console.log('解析的文件路径:', filePath);

      // 验证文件存在且是视频文件
      if (!fs.existsSync(filePath)) {
        console.error('视频文件不存在:', filePath);
        callback({ error: -6 }); // FILE_NOT_FOUND
        return;
      }

      // 检查文件扩展名是否为支持的视频格式
      const ext = path.extname(filePath).toLowerCase();
      const supportedFormats = ['.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v'];

      if (!supportedFormats.includes(ext)) {
        console.error('不支持的视频格式:', ext);
        callback({ error: -10 }); // INVALID_URL
        return;
      }

      // 获取文件统计信息
      const stat = fs.statSync(filePath);

      // 根据文件扩展名确定 MIME 类型
      const mimeTypes: { [key: string]: string } = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.m4v': 'video/mp4',
      };

      const mimeType = mimeTypes[ext] || 'video/mp4';

      console.log('提供视频文件流访问:', filePath, `(${(stat.size / 1024 / 1024).toFixed(2)}MB)`);

      // 创建可读流
      const stream = fs.createReadStream(filePath);

      callback({
        statusCode: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': stat.size.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        },
        data: stream,
      });
    } catch (error) {
      console.error('视频协议处理错误:', error);
      callback({ error: -2 }); // GENERIC_FAILURE
    }
  });
}

// 在应用准备就绪之前注册协议
app.whenReady().then(() => {
  console.log('应用准备就绪，开始注册协议和创建窗口...');

  // 注册自定义协议
  registerVideoProtocol();

  // 创建窗口
  createWindow();
});

// 确保协议在应用启动前就注册
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'video-file',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

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
