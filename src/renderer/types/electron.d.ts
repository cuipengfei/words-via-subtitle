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
  parseSubtitleFile: (filePath: string) => Promise<any>; // 返回类型将根据实际解析结果进行更精确定义

  // 词典查询
  lookupWord: (word: string) => Promise<any>; // 返回类型将根据词典API响应进行更精确定义

  // 配置管理
  getConfig: (key: string) => Promise<any>;
  setConfig: (key: string, value: any) => Promise<void>;
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
