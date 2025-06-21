// 依赖模块
const { watch } = require('chokidar');
const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');
const { createServer } = require('http');

// 创建HTTP服务器用于检查Next.js是否准备就绪
const nextReadyServer = createServer((req, res) => {
  res.writeHead(200);
  res.end('Next.js is ready');
});

// 配置变量
const nextDir = path.join(__dirname, '../src/renderer');
const port = process.env.PORT || 3000;
let electronProcess = null;
let nextProcess = null;

/**
 * 启动Next.js开发服务器
 */
function startNextDev() {
  console.log('Starting Next.js development server...');

  nextProcess = spawn('bun', ['run', 'dev:next'], {
    shell: true,
    env: process.env,
    stdio: 'inherit',
  });

  nextProcess.on('close', (code) => {
    console.log(`Next.js process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error('Next.js failed to start, retrying in 5 seconds...');
      setTimeout(startNextDev, 5000);
    }
  });
}

/**
 * 启动Electron应用
 */
function startElectron() {
  console.log('Starting Electron app...');

  // 先杀掉之前的进程
  if (electronProcess) {
    electronProcess.kill();
    electronProcess = null;
  }

  // 设置环境变量
  const env = { ...process.env };
  env.NODE_ENV = 'development';
  env.ELECTRON_START_URL = `http://localhost:${port}`;

  // 启动Electron
  electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    env,
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
  });
}

/**
 * 等待Next.js准备就绪
 */
function waitForNextReady() {
  return new Promise((resolve) => {
    // 检查Next.js是否准备就绪
    const checkNextReady = () => {
      console.log(`Checking for Next.js server at http://localhost:${port}...`);
      const req = require('http').get(`http://localhost:${port}`, (res) => {
        console.log(`Received status code: ${res.statusCode}`);
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      });
      req.on('error', (err) => {
        console.error('Error checking Next.js server:', err.message);
      });
      req.end();
    };

    const interval = setInterval(checkNextReady, 1000);
  });
}

/**
 * 监视主进程文件变化
 */
function watchMainProcess() {
  const mainWatcher = watch(
    [
      path.join(__dirname, '../src/main/**/*'),
      path.join(__dirname, '../src/shared/**/*'),
      '!node_modules/**',
    ],
    {
      ignored: /node_modules|[\/\\]\./,
      persistent: true,
    }
  );

  mainWatcher.on('change', (path) => {
    console.log(`Main process file changed: ${path}`);
    startElectron();
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    // 启动Next.js
    startNextDev();

    // 等待Next.js准备就绪
    console.log('Waiting for Next.js server to be ready...');
    await waitForNextReady();
    console.log('Next.js server is ready');

    // 启动Electron
    startElectron();

    // 监视主进程文件变化
    watchMainProcess();
  } catch (error) {
    console.error('Dev script error:', error);
    process.exit(1);
  }
}

// 监听进程终止信号
process.on('SIGINT', () => {
  console.log('Stopping development servers...');

  if (nextProcess) nextProcess.kill();
  if (electronProcess) electronProcess.kill();

  process.exit(0);
});

// 执行主函数
main();
