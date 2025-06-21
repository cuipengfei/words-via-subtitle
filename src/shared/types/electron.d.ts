declare module 'electron' {
  // 导出 Electron 模块中需要的类型
  import {
    IpcMain,
    IpcMainEvent,
    IpcMainInvokeEvent,
    WebContents,
    BrowserWindow,
    App,
    Dialog,
  } from 'electron';

  export { IpcMain, IpcMainEvent, IpcMainInvokeEvent, WebContents, BrowserWindow, App, Dialog };

  // 导出其他可能需要的 Electron 模块和对象
  export const ipcMain: IpcMain;
  export const app: App;
  export const dialog: Dialog;
}
