import * as fs from 'fs/promises';
import * as path from 'path';
import { SubtitleEntry, Word, WordOccurrence, ParseResult } from '../../shared/types';

// A simple word tokenizer
function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/<[^>]*>/g, ' ') // Remove HTML tags
      .replace(/[\d{}\\]/g, ' ') // Remove digits and brackets
      .match(/[a-z']+/g) || []
  ); // Match words with apostrophes
}

// Time string to seconds
function timeToSeconds(time: string): number {
  const parts = time.split(',')[0].split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * 字幕解析服务类
 * 负责解析SRT和ASS格式字幕文件，并提取单词
 */
export class SubtitleParserService {
  /**
   * 解析字幕文件
   * @param filePath 字幕文件路径
   * @returns 解析结果，包含字幕条目和单词列表
   */
  async parseFile(filePath: string): Promise<ParseResult> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const fileExt = path.extname(filePath).toLowerCase();

      let entries: SubtitleEntry[];

      if (fileExt === '.srt') {
        entries = this.parseSrtContent(fileContent);
      } else if (fileExt === '.ass' || fileExt === '.ssa') {
        entries = this.parseAssContent(fileContent);
      } else {
        return {
          success: false,
          error: `不支持的字幕文件格式: ${fileExt}`,
        };
      }

      const words = this.extractWords(entries);

      return {
        success: true,
        data: {
          entries,
          words,
        },
      };
    } catch (error) {
      console.error(`解析文件时出错 ${filePath}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '解析文件时发生未知错误',
      };
    }
  }

  /**
   * 解析 SRT 格式内容
   * @param content SRT 文件内容
   * @returns 字幕条目数组
   */
  private parseSrtContent(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = content.split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const idStr = lines[i];
      if (!idStr || !/\d+/.test(idStr)) {
        i++;
        continue;
      }
      const id = parseInt(idStr, 10);

      const timeLine = lines[i + 1];
      if (!timeLine) break;
      const [startTime, endTime] = timeLine.split(' --> ');

      const textLines: string[] = [];
      let j = i + 2;
      while (j < lines.length && lines[j]) {
        textLines.push(lines[j]);
        j++;
      }

      entries.push({
        id,
        startTime,
        endTime,
        text: textLines.join(' '),
      });

      i = j + 1;
    }
    return entries;
  }

  /**
   * 解析 ASS/SSA 格式内容
   * @param content ASS/SSA 文件内容
   * @returns 字幕条目数组
   */
  private parseAssContent(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = [];
    const lines = content.split(/\r?\n/);
    const dialogueLines = lines.filter((line) => line.startsWith('Dialogue:'));

    for (let i = 0; i < dialogueLines.length; i++) {
      const line = dialogueLines[i];
      const parts = line.split(',');
      if (parts.length > 9) {
        const startTime = parts[1];
        const endTime = parts[2];
        const text = parts.slice(9).join(',');
        entries.push({
          id: i + 1,
          startTime,
          endTime,
          text: text.replace(/\{.*?\}/g, ''), // 移除 ASS 特效标签
        });
      }
    }
    return entries;
  }

  /**
   * 从字幕条目中提取单词并计数
   * @param entries 字幕条目数组
   * @returns 单词数组
   */
  private extractWords(entries: SubtitleEntry[]): Word[] {
    const wordMap = new Map<string, { count: number; occurrences: WordOccurrence[] }>();

    for (const entry of entries) {
      const tokens = tokenize(entry.text);
      for (const token of tokens) {
        const existing = wordMap.get(token) || { count: 0, occurrences: [] };

        // 将时间字符串转换为毫秒
        const startTimeMs = this.timeStringToMs(entry.startTime);
        const endTimeMs = this.timeStringToMs(entry.endTime);

        existing.count += 1;
        existing.occurrences.push({
          startTime: startTimeMs,
          endTime: endTimeMs,
          context: entry.text,
          subtitleId: entry.id,
        });

        wordMap.set(token, existing);
      }
    }

    const sortedWords = Array.from(wordMap.entries()).sort((a, b) => b[1].count - a[1].count);

    return sortedWords.map(([original, data]) => ({
      original,
      count: data.count,
      occurrences: data.occurrences,
    }));
  }

  /**
   * 将时间字符串转换为毫秒
   * @param timeStr 时间字符串 (如 "00:01:23,456" 或 "0:01:23.45")
   * @returns 毫秒数
   */
  private timeStringToMs(timeStr: string): number {
    try {
      // 处理 SRT 格式: "00:01:23,456"
      if (timeStr.includes(',')) {
        const [time, ms] = timeStr.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600000 + minutes * 60000 + seconds * 1000 + Number(ms);
      }

      // 处理 ASS 格式: "0:01:23.45"
      if (timeStr.includes('.')) {
        const [time, centiseconds] = timeStr.split('.');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600000 + minutes * 60000 + seconds * 1000 + Number(centiseconds) * 10;
      }

      // 默认处理: "00:01:23"
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      return hours * 3600000 + minutes * 60000 + seconds * 1000;
    } catch (error) {
      console.warn(`无法解析时间字符串: ${timeStr}`, error);
      return 0;
    }
  }
}
