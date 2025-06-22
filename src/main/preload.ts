import { contextBridge, ipcRenderer } from 'electron';

// 临时内联 IPC 通道定义，避免模块导入问题
const IpcChannels = {
  PARSE_SUBTITLE_FILE: 'parse-subtitle-file',
  GET_SUBTITLES: 'get-subtitles',
  TRANSLATE_WORD: 'translate-word',
  GET_WORD_DEFINITION: 'get-word-definition',
  SAVE_LEARNED_WORD: 'save-learned-word',
  GET_LEARNED_WORDS: 'get-learned-words',
  UPDATE_WORD_STATUS: 'update-word-status',
  OPEN_VIDEO_FILE: 'open-video-file',
  OPEN_SUBTITLE_FILE: 'open-subtitle-file',
  SAVE_CONFIG: 'save-config',
  GET_SETTINGS: 'get-settings',
  UPDATE_SETTINGS: 'update-settings',
  LOOKUP_WORD: 'lookup-word',
  CHECK_FILE_EXISTS: 'check-file-exists',
};

// 临时内联类型定义
interface ElectronAPI {
  parseSubtitleFile: (filePath: string) => Promise<any>;
  getSubtitles: () => Promise<any>;
  translateWord: (word: string) => Promise<any>;
  getWordDefinition: (word: string) => Promise<any>;
  saveLearnedWord: (word: any) => Promise<void>;
  getLearnedWords: () => Promise<any>;
  updateWordStatus: (word: string, status: any) => Promise<void>;
  openVideoFile: () => Promise<string>;
  openSubtitleFile: () => Promise<string>;
  saveConfig: (data: any) => Promise<void>;
  getSettings: () => Promise<any>;
  updateSettings: (settings: any) => Promise<void>;
  lookupWord: (word: string) => Promise<any>;
  checkFileExists: (filePath: string) => Promise<boolean>;
  isDevMode: () => boolean;
}

/**
 * @module Preload
 * @description 安全地将主进程的API暴露给渲染进程。
 * 使用 contextBridge 来避免将完整的 ipcRenderer/ipcMain 模块暴露给渲染器，
 * 这有助于最小化安全风险。
 */

// 定义需要暴露给渲染进程的API
const electronAPI: ElectronAPI = {
  // 字幕相关
  parseSubtitleFile: (filePath: string) =>
    ipcRenderer.invoke(IpcChannels.PARSE_SUBTITLE_FILE, filePath),
  getSubtitles: () => ipcRenderer.invoke(IpcChannels.GET_SUBTITLES),

  // 词典相关
  translateWord: (word: string) => ipcRenderer.invoke(IpcChannels.TRANSLATE_WORD, word),
  getWordDefinition: (word: string) => ipcRenderer.invoke(IpcChannels.GET_WORD_DEFINITION, word),

  // 学习记录相关
  saveLearnedWord: (word: any) => ipcRenderer.invoke(IpcChannels.SAVE_LEARNED_WORD, word),
  getLearnedWords: () => ipcRenderer.invoke(IpcChannels.GET_LEARNED_WORDS),
  updateWordStatus: (word: string, status: any) =>
    ipcRenderer.invoke(IpcChannels.UPDATE_WORD_STATUS, word, status),

  // 文件操作
  openVideoFile: () => ipcRenderer.invoke(IpcChannels.OPEN_VIDEO_FILE),
  openSubtitleFile: () => ipcRenderer.invoke(IpcChannels.OPEN_SUBTITLE_FILE),
  saveConfig: (data: any) => ipcRenderer.invoke(IpcChannels.SAVE_CONFIG, data),

  // 应用设置
  getSettings: () => ipcRenderer.invoke(IpcChannels.GET_SETTINGS),
  updateSettings: (settings: any) => ipcRenderer.invoke(IpcChannels.UPDATE_SETTINGS, settings),
  // 词典查询
  lookupWord: (word: string) => ipcRenderer.invoke(IpcChannels.LOOKUP_WORD, word),

  // 文件检查
  checkFileExists: (filePath: string) =>
    ipcRenderer.invoke(IpcChannels.CHECK_FILE_EXISTS, filePath),

  // 系统功能
  isDevMode: () => process.env.NODE_ENV === 'development',
};

// 将API安全地暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 向渲染进程暴露版本信息
contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '1.0.0',
});

// 添加控制台日志，方便调试
console.log('Preload script has been loaded');
