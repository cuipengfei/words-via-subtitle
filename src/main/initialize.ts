import { app } from 'electron';
import { SubtitleParserService } from './services/subtitleParser';
import { DictionaryService } from './services/dictionaryService';
import { LearningRecordService } from './services/learningRecordService';
import { SettingsService } from './services/settingsService';
import { registerIpcHandlers } from './ipc-handlers';

/**
 * 初始化应用程序服务
 * 创建所有主进程服务实例并注册IPC处理器
 */
export async function initializeServices(): Promise<void> {
  console.log('正在初始化应用服务...');

  try {
    // 初始化设置服务
    const settingsService = new SettingsService();
    console.log('设置服务已初始化');

    // 初始化字幕解析服务
    const subtitleParserService = new SubtitleParserService();
    await subtitleParserService.initialize();
    console.log('字幕解析服务已初始化');

    // 初始化词典服务
    const dictionaryService = new DictionaryService();
    await dictionaryService.initialize();
    console.log('词典服务已初始化');

    // 初始化学习记录服务
    const learningRecordService = new LearningRecordService();
    await learningRecordService.initialize();
    console.log('学习记录服务已初始化');

    // 注册IPC处理器
    registerIpcHandlers();
    console.log('IPC处理器已注册');

    // 设置应用程序事件处理器
    setupApplicationEvents();

    console.log('所有服务初始化完成');
  } catch (error) {
    console.error('服务初始化失败:', error);
    throw error;
  }
}

/**
 * 设置应用程序级别的事件处理
 */
function setupApplicationEvents(): void {
  // 处理应用程序退出事件
  app.on('will-quit', () => {
    console.log('应用即将退出，执行清理操作...');
    // 在这里执行必要的清理工作
  });

  // 处理系统休眠事件 (使用 powerMonitor 替代)
  // powerMonitor.on('suspend', () => {
  //   console.log('系统即将休眠，保存应用状态...');
  //   // 保存应用状态
  // });
}
