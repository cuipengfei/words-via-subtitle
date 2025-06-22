import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../shared/ipc';
import { SubtitleParserService } from './services/subtitleParser';
import { DictionaryService } from './services/dictionaryService';
import * as fs from 'fs';

export function registerIpcHandlers(
  subtitleParser: SubtitleParserService,
  dictionaryService: DictionaryService
) {
  console.log('注册 IPC 处理器...');

  // 文件操作处理器
  ipcMain.handle(IpcChannels.OPEN_SUBTITLE_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: '选择字幕文件',
      filters: [
        { name: '字幕文件', extensions: ['srt', 'ass', 'ssa', 'vtt'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // 视频文件选择处理器
  ipcMain.handle(IpcChannels.OPEN_VIDEO_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: '选择视频文件',
      filters: [
        { name: '视频文件', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // 获取安全视频URL处理器
  ipcMain.handle(IpcChannels.GET_VIDEO_URL, async (_, filePath: string) => {
    try {
      // 验证文件存在
      if (!fs.existsSync(filePath)) {
        throw new Error(`视频文件不存在: ${filePath}`);
      }

      // 验证是支持的视频格式
      const ext = filePath.split('.').pop()?.toLowerCase();
      const supportedFormats = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'];

      if (!ext || !supportedFormats.includes(ext)) {
        throw new Error(`不支持的视频格式: ${ext}`);
      }

      // 由于设置了 webSecurity: false，可以直接使用 file:// URL
      const videoUrl = `file://${filePath}`;
      console.log(`生成视频文件URL: ${videoUrl}`);
      return videoUrl;
    } catch (error) {
      console.error('生成视频URL失败:', error);
      throw error;
    }
  });

  // 字幕解析处理器
  ipcMain.handle(IpcChannels.PARSE_SUBTITLE_FILE, async (_, filePath: string) => {
    console.log(`主进程收到解析请求: ${filePath}`);
    const result = await subtitleParser.parseFile(filePath);
    if (result.success) {
      console.log(
        `解析成功: ${result.data?.entries.length} 条字幕, ${result.data?.words.length} 个单词`
      );
    } else {
      console.error(`解析失败: ${result.error}`);
    }
    return result;
  });

  // 单词查询处理器
  ipcMain.handle(IpcChannels.LOOKUP_WORD, async (_, word: string) => {
    console.log(`主进程收到单词查询请求: ${word}`);
    const definition = await dictionaryService.lookupWord(word);
    if (definition) {
      console.log(`找到释义: ${word}`);
    } else {
      console.log(`未找到释义: ${word}`);
    }
    return definition;
  });
  // 文件检查处理器
  ipcMain.handle(IpcChannels.CHECK_FILE_EXISTS, async (_, filePath: string) => {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  });

  console.log('IPC 处理器注册完成');
}
