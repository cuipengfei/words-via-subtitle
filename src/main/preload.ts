import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, IpcChannels } from '@/shared/ipc';

/**
 * 预加载脚本
 * 通过Electron的contextBridge安全地将主进程API暴露给渲染进程
 */

// 创建安全的IPC通信接口
const api: ElectronAPI = {
  // 字幕相关
  parseSubtitleFile: (filePath: string) =>
    ipcRenderer.invoke(IpcChannels.PARSE_SUBTITLE_FILE, filePath),
  getSubtitles: () => ipcRenderer.invoke(IpcChannels.GET_SUBTITLES),

  // 词典相关
  translateWord: (word: string) => ipcRenderer.invoke(IpcChannels.TRANSLATE_WORD, word),
  getWordDefinition: (word: string) => ipcRenderer.invoke(IpcChannels.GET_WORD_DEFINITION, word),

  // 学习记录相关
  saveLearnedWord: (word) => ipcRenderer.invoke(IpcChannels.SAVE_LEARNED_WORD, word),
  getLearnedWords: () => ipcRenderer.invoke(IpcChannels.GET_LEARNED_WORDS),
  updateWordStatus: (word, status) =>
    ipcRenderer.invoke(IpcChannels.UPDATE_WORD_STATUS, word, status),

  // 文件操作
  openVideoFile: () => ipcRenderer.invoke(IpcChannels.OPEN_VIDEO_FILE),
  openSubtitleFile: () => ipcRenderer.invoke(IpcChannels.OPEN_SUBTITLE_FILE),
  saveConfig: (data) => ipcRenderer.invoke(IpcChannels.SAVE_CONFIG, data),

  // 应用设置
  getSettings: () => ipcRenderer.invoke(IpcChannels.GET_SETTINGS),
  updateSettings: (settings) => ipcRenderer.invoke(IpcChannels.UPDATE_SETTINGS, settings),

  // 系统功能
  isDevMode: () => process.env.NODE_ENV === 'development',
};

// 将API安全地暴露给渲染进程
contextBridge.exposeInMainWorld('electron', api);

// 向渲染进程暴露版本信息
contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '1.0.0',
});

// 添加控制台日志，方便调试
console.log('Preload script has been loaded');

// 类型声明，使渲染进程的TypeScript能够识别window.electron
declare global {
  interface Window {
    electron: ElectronAPI;
    appInfo: {
      version: string;
    };
  }
}
