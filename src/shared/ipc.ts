// 主进程与渲染进程IPC通信接口定义
import { IpcMainInvokeEvent } from 'electron';

// IPC通道名称常量
export const IpcChannels = {
  OPEN_SUBTITLE_FILE: 'open-subtitle-file',
  PARSE_SUBTITLE_FILE: 'parse-subtitle-file',
  LOOKUP_WORD: 'lookup-word', // 新增：用于查询单词
  OPEN_VIDEO_FILE: 'open-video-file', // 新增：用于选择视频文件
  GET_VIDEO_URL: 'get-video-url', // 新增：用于获取安全的视频URL
  GET_SETTINGS: 'get-settings',
  UPDATE_SETTINGS: 'update-settings',
  SAVE_CONFIG: 'save-config',
  UPDATE_WORD_STATUS: 'update-word-status',
  CHECK_FILE_EXISTS: 'check-file-exists', // 新增：用于检查文件是否存在
} as const;

export type IpcChannelKeys = keyof typeof IpcChannels;
export type IpcChannelValues = (typeof IpcChannels)[IpcChannelKeys];

// 字幕相关类型
export interface Subtitle {
  id: number;
  startTime: number; // 毫秒
  endTime: number; // 毫秒
  text: string;
}

export interface SubtitleParseResult {
  subtitles: Subtitle[];
  fileName: string;
  format: string;
  words: WordTimeMapping[];
}

export interface WordTimeMapping {
  word: string;
  normalizedWord: string; // 标准化后的单词（小写、去除变形）
  occurrences: Array<{
    startTime: number;
    endTime: number;
    context: string; // 单词所在的上下文
    subtitleId: number;
  }>;
}

// 词典相关类型
export interface TranslationResult {
  word: string;
  translations: string[];
  phonetic?: string;
  definitions?: Definition[];
  examples?: string[];
}

export interface Definition {
  partOfSpeech: string;
  meaning: string;
  examples?: string[];
}

// 学习记录相关类型
export enum WordStatus {
  NEW = 'new', // 新单词
  LEARNING = 'learning', // 正在学习
  KNOWN = 'known', // 已掌握
  IGNORED = 'ignored', // 已忽略
}

export interface LearnedWord {
  word: string;
  status: WordStatus;
  lastReviewDate?: number;
  nextReviewDate?: number;
  reviewCount: number;
  notes?: string;
}

// 设置相关类型
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultDictionary: string;
  autoPlaySubtitle: boolean;
  repeatTimes: number;
  playbackSpeed: number;
  subtitleFontSize: number;
  enableAutoSave: boolean;
  dataPath: string;
}

// IPC处理器类型
export type IpcHandler<T, R> = (event: IpcMainInvokeEvent, arg: T) => Promise<R>;

// 向渲染进程暴露的API类型定义
export interface ElectronAPI {
  // 字幕相关
  parseSubtitleFile: (filePath: string) => Promise<SubtitleParseResult>;
  getSubtitles: () => Promise<Subtitle[]>;

  // 词典相关
  translateWord: (word: string) => Promise<TranslationResult>;
  getWordDefinition: (word: string) => Promise<TranslationResult>;

  // 学习记录相关
  saveLearnedWord: (word: LearnedWord) => Promise<void>;
  getLearnedWords: () => Promise<LearnedWord[]>;
  updateWordStatus: (word: string, status: WordStatus) => Promise<void>;

  // 文件操作
  openVideoFile: () => Promise<string>;
  openSubtitleFile: () => Promise<string>;
  getVideoUrl: (filePath: string) => Promise<string>;
  saveConfig: (data: unknown) => Promise<void>;

  // 应用设置
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;

  // 系统功能
  isDevMode: () => boolean;
}

export type IpcChannel = keyof typeof IpcChannels;
export type IpcChannelValue = (typeof IpcChannels)[IpcChannel];
