import { app, Menu, BrowserWindow, dialog } from 'electron';
import { join } from 'path';

export function createMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin';

  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    // 文件菜单
    {
      label: '文件',
      submenu: [
        {
          label: '打开字幕文件',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: '字幕文件', extensions: ['srt', 'ass'] },
                { name: '所有文件', extensions: ['*'] },
              ],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('file-opened', result.filePaths[0]);
            }
          },
        },
        {
          label: '选择视频文件',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: '视频文件', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv'] },
                { name: '所有文件', extensions: ['*'] },
              ],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('video-opened', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        {
          label: '导出已知单词',
          click: () => {
            mainWindow.webContents.send('export-known-words');
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },

    // 编辑菜单
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },

    // 视图菜单
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },

    // 学习菜单
    {
      label: '学习',
      submenu: [
        {
          label: '标记为已知',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.send('mark-known');
          },
        },
        {
          label: '标记为拼写错误',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.send('mark-misspell');
          },
        },
        { type: 'separator' },
        {
          label: '朗读单词',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('pronounce-word');
          },
        },
      ],
    },

    // 帮助菜单
    {
      role: 'help',
      submenu: [
        {
          label: '关于',
          click: async () => {
            dialog.showMessageBox(mainWindow, {
              title: '关于字幕学单词',
              message: '字幕学单词 v1.0.0',
              detail: '一个现代化的英语词汇学习工具，基于 Electron + Next.js + TypeScript 开发。',
              buttons: ['确定'],
              icon: join(app.getAppPath(), 'assets', 'icons', 'icon.png'),
            });
          },
        },
      ],
    },
  ];

  // MacOS特有的菜单项
  if (isMac) {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
