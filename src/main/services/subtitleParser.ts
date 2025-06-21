import { IpcMainInvokeEvent } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Subtitle, SubtitleParseResult, WordTimeMapping } from '@/shared/ipc';

/**
 * 字幕解析服务类
 * 负责解析SRT和ASS格式字幕文件，并提取单词
 */
export class SubtitleParserService {
  private currentSubtitles: Subtitle[] = [];
  private currentWordMappings: WordTimeMapping[] = [];
  private currentFileName: string = '';
  private currentFormat: string = '';

  /**
   * 初始化字幕解析服务
   */
  async initialize(): Promise<void> {
    console.log('字幕解析服务初始化中...');
    // 在这里可以加载所需要的资源或执行初始化操作
    return Promise.resolve();
  }

  /**
   * 解析字幕文件
   * @param filePath 字幕文件路径
   * @returns 解析结果，包含字幕和单词时间映射
   */
  async parseFile(filePath: string): Promise<SubtitleParseResult> {
    try {
      // 读取文件内容
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const fileExt = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);

      // 根据文件扩展名选择解析方法
      let result: { subtitles: Subtitle[]; words: WordTimeMapping[] };

      if (fileExt === '.srt') {
        result = await this.parseSrtContent(fileContent);
        this.currentFormat = 'srt';
      } else if (fileExt === '.ass' || fileExt === '.ssa') {
        result = await this.parseAssContent(fileContent);
        this.currentFormat = 'ass';
      } else {
        throw new Error(`不支持的字幕文件格式: ${fileExt}`);
      }

      // 更新当前状态
      this.currentSubtitles = result.subtitles;
      this.currentWordMappings = result.words;
      this.currentFileName = fileName;

      return {
        subtitles: result.subtitles,
        fileName: fileName,
        format: this.currentFormat,
        words: result.words,
      };
    } catch (error) {
      console.error('字幕解析失败:', error);
      throw error;
    }
  }
  /**
   * 获取当前加载的字幕
   * @returns 当前字幕数组
   */
  getCurrentSubtitles(): Subtitle[] {
    return this.currentSubtitles;
  }

  /**
   * 获取当前文件名
   * @returns 当前文件名
   */
  getCurrentFileName(): string {
    return this.currentFileName;
  }

  /**
   * 获取当前字幕格式
   * @returns 当前字幕格式（srt, ass等）
   */
  getCurrentFormat(): string {
    return this.currentFormat;
  }

  /**
   * 获取当前单词时间映射
   * @returns 单词时间映射数组
   */
  getWordTimeMappings(): WordTimeMapping[] {
    return this.currentWordMappings;
  }

  /**
   * 基于特定时间点获取当前应显示的字幕
   * @param time 时间点（毫秒）
   * @returns 当前时间点应该显示的字幕，如果没有则返回null
   */
  getSubtitleAtTime(time: number): Subtitle | null {
    if (!this.currentSubtitles || this.currentSubtitles.length === 0) {
      return null;
    }

    // 查找时间范围内的字幕
    const subtitle = this.currentSubtitles.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    );

    return subtitle || null;
  }

  /**
   * 获取特定时间点附近的单词
   * @param time 时间点（毫秒）
   * @param rangeMs 时间范围（毫秒）
   * @returns 在指定时间范围内出现的单词
   */
  getWordsNearTime(time: number, rangeMs: number = 2000): WordTimeMapping[] {
    if (!this.currentWordMappings || this.currentWordMappings.length === 0) {
      return [];
    }

    const result: WordTimeMapping[] = [];
    const startTime = time - rangeMs / 2;
    const endTime = time + rangeMs / 2;

    // 查找时间范围内的单词
    this.currentWordMappings.forEach((mapping) => {
      // 检查是否有任何出现在指定时间范围内
      const hasOccurrence = mapping.occurrences.some(
        (occ) =>
          (occ.startTime >= startTime && occ.startTime <= endTime) ||
          (occ.endTime >= startTime && occ.endTime <= endTime)
      );

      if (hasOccurrence) {
        result.push(mapping);
      }
    });

    return result;
  }

  /**
   * 解析SRT格式字幕内容
   * @param content SRT文本内容
   * @returns 解析结果，包含字幕和单词时间映射
   */
  private async parseSrtContent(
    content: string
  ): Promise<{ subtitles: Subtitle[]; words: WordTimeMapping[] }> {
    // 使用简单的SRT解析逻辑
    const subtitles: Subtitle[] = [];
    const blocks = content.trim().split(/\n\s*\n/);

    for (let i = 0; i < blocks.length; i++) {
      const lines = blocks[i].split('\n');
      if (lines.length >= 3) {
        const id = parseInt(lines[0].trim());
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);

        if (timeMatch) {
          const startTime = this.parseTimeToMs(timeMatch[1]);
          const endTime = this.parseTimeToMs(timeMatch[2]);
          const text = lines.slice(2).join('\n').trim();

          subtitles.push({
            id: id || i + 1,
            startTime,
            endTime,
            text,
          });
        }
      }
    }

    // 提取单词
    const words = await this.extractWordsFromSubtitles(subtitles);

    return { subtitles, words };
  }

  /**
   * 解析ASS格式字幕内容
   * 注意: 这是一个简化的实现，实际的ASS解析会更复杂
   * @param content ASS文本内容
   * @returns 解析结果，包含字幕和单词时间映射
   */
  private async parseAssContent(
    content: string
  ): Promise<{ subtitles: Subtitle[]; words: WordTimeMapping[] }> {
    const lines = content.split(/\r?\n/);
    const subtitles: Subtitle[] = [];
    let id = 1;

    // 找到[Events]部分
    const eventsIndex = lines.findIndex((line) => line.trim() === '[Events]');
    if (eventsIndex === -1) {
      throw new Error('无效的ASS文件格式: 未找到[Events]部分');
    }

    // 找到对话行的格式定义行
    let formatIndex = -1;
    for (let i = eventsIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('Format:')) {
        formatIndex = i;
        break;
      }
    }

    if (formatIndex === -1) {
      throw new Error('无效的ASS文件格式: 未找到Format行');
    }

    // 解析Format行以确定字段位置
    const formatFields = lines[formatIndex]
      .substring('Format:'.length)
      .split(',')
      .map((f) => f.trim());
    const textIndex = formatFields.findIndex((field) => field === 'Text');
    const startIndex = formatFields.findIndex((field) => field === 'Start');
    const endIndex = formatFields.findIndex((field) => field === 'End');

    if (textIndex === -1 || startIndex === -1 || endIndex === -1) {
      throw new Error('无效的ASS文件格式: Format行缺少必要字段');
    }

    // 解析对话行
    for (let i = formatIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Dialogue:')) {
        const parts = line.substring('Dialogue:'.length).split(',');

        if (parts.length > Math.max(textIndex, startIndex, endIndex)) {
          // 获取文本内容 (可能包含格式代码)
          let text = parts.slice(textIndex).join(',');
          // 移除ASS格式代码
          text = text.replace(/\{.*?\}/g, '');

          // 解析时间 (格式如 0:00:00.00)
          const startTime = this.parseAssTime(parts[startIndex].trim());
          const endTime = this.parseAssTime(parts[endIndex].trim());

          subtitles.push({ id: id++, text, startTime, endTime });
        }
      }
    }

    // 提取单词
    const words = await this.extractWordsFromSubtitles(subtitles);

    return { subtitles, words };
  }

  /**
   * 将SRT格式的时间转换为毫秒
   * @param timeStr 时间字符串，格式如 00:00:00,000
   * @returns 毫秒时间戳
   */
  private parseTimeToMs(timeStr: string): number {
    const [time, ms] = timeStr.split(',');
    const [h, m, s] = time.split(':').map(Number);
    return (h * 3600 + m * 60 + s) * 1000 + parseInt(ms);
  }

  /**
   * 将ASS格式的时间转换为毫秒
   * @param timeStr 时间字符串，格式如 0:00:00.00
   * @returns 毫秒时间戳
   */
  private parseAssTime(timeStr: string): number {
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h * 3600 + m * 60 + s) * 1000;
  }

  /**
   * 从字幕中提取单词及其时间映射
   * @param subtitles 字幕数组
   * @returns 单词时间映射数组
   */
  private async extractWordsFromSubtitles(subtitles: Subtitle[]): Promise<WordTimeMapping[]> {
    const wordMap = new Map<string, WordTimeMapping>();

    subtitles.forEach((subtitle) => {
      // 移除HTML标签和标点符号
      const cleanText = subtitle.text
        .replace(/<[^>]*>/g, '')
        .replace(/[.,?!":;\-—–()\[\]{}]/g, ' ');

      // 提取单词
      const words = cleanText.split(/\s+/).filter(
        (word: string) =>
          // 过滤掉空字符串和纯数字
          word && !/^\d+$/.test(word)
      );

      // 计算每个单词的时间比例 (简化处理，假设单词平均分布)
      const duration = subtitle.endTime - subtitle.startTime;
      const wordDuration = duration / words.length;

      words.forEach((word: string, index: number) => {
        // 转为小写以标准化
        const normalizedWord = word.toLowerCase();

        // 如果这不是一个有效的单词，跳过
        if (normalizedWord.length <= 1) return;

        // 计算单词的近似时间点
        const startTime = subtitle.startTime + index * wordDuration;
        const endTime = startTime + wordDuration;

        // 更新或创建单词条目
        if (!wordMap.has(normalizedWord)) {
          wordMap.set(normalizedWord, {
            word: word,
            normalizedWord: normalizedWord,
            occurrences: [],
          });
        }

        // 获取上下文（包含前后的单词）
        const contextStart = Math.max(0, index - 2);
        const contextEnd = Math.min(words.length, index + 3);
        const context = words.slice(contextStart, contextEnd).join(' ');

        wordMap.get(normalizedWord)!.occurrences.push({
          startTime,
          endTime,
          context,
          subtitleId: subtitle.id,
        });
      });
    });

    return Array.from(wordMap.values());
  }
}
