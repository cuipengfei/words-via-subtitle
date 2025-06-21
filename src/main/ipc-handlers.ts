import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../shared/ipc';
import { SubtitleParserService } from './services/subtitleParser';

// 创建服务实例
const subtitleParser = new SubtitleParserService();

export function registerIpcHandlers() {
  console.log('注册 IPC 处理器...');

  // 初始化服务
  subtitleParser.initialize();

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

  ipcMain.handle(IpcChannels.OPEN_VIDEO_FILE, async () => {
    const result = await dialog.showOpenDialog({
      title: '选择视频文件',
      filters: [
        { name: '视频文件', extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  // 字幕解析处理器
  ipcMain.handle(IpcChannels.PARSE_SUBTITLE_FILE, async (_, filePath: string) => {
    console.log('解析字幕文件:', filePath);
    try {
      const result = await subtitleParser.parseFile(filePath);
      console.log(`字幕解析成功: ${result.subtitles.length} 条字幕, ${result.words.length} 个单词`);
      return result;
    } catch (error) {
      console.error('字幕解析失败:', error);
      throw error;
    }
  });

  ipcMain.handle(IpcChannels.TRANSLATE_WORD, async (_, word: string) => {
    console.log('翻译单词:', word);
    // TODO: 实现词典查询逻辑
    return { word, translations: ['暂未实现'], phonetic: '', definitions: [], examples: [] };
  });

  console.log('IPC 处理器注册完成');
}
