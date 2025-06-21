import { SubtitleParseResult, TranslationResult, AppSettings } from '@/shared/ipc';

// 定义ElectronAPI接口
interface ElectronAPI {
  // 文件操作
  openSubtitleFile: (callback: (filePath: string) => void) => () => void;
  openVideoFile: (callback: (filePath: string) => void) => () => void;

  // 单词操作
  markWordAsKnown: (callback: () => void) => () => void;
  markWordAsMisspell: (callback: () => void) => () => void;
  pronounceWord: (callback: () => void) => () => void;

  // 数据传输
  exportKnownWords: (callback: () => void) => () => void;

  // 字幕解析与处理
  parseSubtitleFile: (filePath: string) => Promise<SubtitleParseResult>;

  // 词典查询
  lookupWord: (word: string) => Promise<TranslationResult>;

  // 配置管理
  getConfig: <T = unknown>(key: string) => Promise<T>;
  setConfig: (key: string, value: unknown) => Promise<void>;
}

// 定义应用信息接口
interface AppInfo {
  version: string;
}

// 扩展Window接口
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    appInfo: AppInfo;
  }
}
