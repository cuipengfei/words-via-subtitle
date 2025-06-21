import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../shared/ipc';
import { SubtitleParserService } from './services/subtitleParser';
import { DictionaryService } from './services/dictionaryService';

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

  console.log('IPC 处理器注册完成');
}
