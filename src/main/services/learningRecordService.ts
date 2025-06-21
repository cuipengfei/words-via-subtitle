import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import Store from 'electron-store';
import { WordStatus, LearnedWord } from '@/shared/ipc';

// 定义存储结构的类型
interface LearningRecordSchema {
  knownWords: string[];
  misspelledWords: string[];
  learningHistory: Array<{
    date: string;
    newWordsLearned: number;
    totalTimeSpent: number; // 以分钟计
    sessions: Array<{
      subtitle: string;
      startTime: string;
      endTime: string;
      wordsLearned: string[];
    }>;
  }>;
}

// 学习记录服务
export class LearningRecordService {
  private store: Store<LearningRecordSchema>;
  private currentSession: {
    subtitle: string | null;
    startTime: Date | null;
    wordsLearned: Set<string>;
  };

  constructor() {
    // 初始化本地存储
    this.store = new Store<LearningRecordSchema>({
      name: 'learning-records',
      defaults: {
        knownWords: [],
        misspelledWords: [],
        learningHistory: [],
      },
    });

    // 初始化当前学习会话
    this.currentSession = {
      subtitle: null,
      startTime: null,
      wordsLearned: new Set<string>(),
    };
  }

  /**
   * 初始化学习记录服务
   */
  public initialize(): void {
    // 注册IPC处理程序
    ipcMain.handle('get-known-words', () => {
      return this.getKnownWords();
    });

    ipcMain.handle('add-known-word', (_, word: string) => {
      return this.addKnownWord(word);
    });

    ipcMain.handle('add-misspelled-word', (_, word: string) => {
      return this.addMisspelledWord(word);
    });

    ipcMain.handle('start-learning-session', (_, subtitlePath: string) => {
      return this.startLearningSession(subtitlePath);
    });

    ipcMain.handle('end-learning-session', () => {
      return this.endLearningSession();
    });

    ipcMain.handle('export-known-words', () => {
      return this.exportKnownWords();
    });

    console.log('学习记录服务初始化完成');
  }

  /**
   * 获取已知单词列表
   */
  public getKnownWords(): string[] {
    return this.store.get('knownWords', []);
  }

  /**
   * 添加已知单词
   */
  public addKnownWord(word: string): void {
    const normalizedWord = word.toLowerCase().trim();
    const knownWords = new Set(this.store.get('knownWords', []));

    // 如果单词不在已知列表中，添加它
    if (!knownWords.has(normalizedWord)) {
      knownWords.add(normalizedWord);
      this.store.set('knownWords', Array.from(knownWords));

      // 如果单词在拼写错误列表中，将其移除
      this.removeMisspelledWord(normalizedWord);

      // 将单词添加到当前会话的学习记录
      if (this.currentSession.startTime) {
        this.currentSession.wordsLearned.add(normalizedWord);
      }

      console.log(`添加已知单词: ${normalizedWord}`);
    }
  }

  /**
   * 添加拼写错误的单词
   */
  public addMisspelledWord(word: string): void {
    const normalizedWord = word.toLowerCase().trim();
    const misspelledWords = new Set(this.store.get('misspelledWords', []));

    if (!misspelledWords.has(normalizedWord)) {
      misspelledWords.add(normalizedWord);
      this.store.set('misspelledWords', Array.from(misspelledWords));
      console.log(`添加拼写错误单词: ${normalizedWord}`);
    }
  }

  /**
   * 从拼写错误列表中移除单词
   */
  private removeMisspelledWord(word: string): void {
    const normalizedWord = word.toLowerCase().trim();
    const misspelledWords = new Set(this.store.get('misspelledWords', []));

    if (misspelledWords.has(normalizedWord)) {
      misspelledWords.delete(normalizedWord);
      this.store.set('misspelledWords', Array.from(misspelledWords));
    }
  }

  /**
   * 开始学习会话
   */
  public startLearningSession(subtitlePath: string): void {
    // 结束任何进行中的会话
    if (this.currentSession.startTime) {
      this.endLearningSession();
    }

    // 开始新的会话
    this.currentSession = {
      subtitle: subtitlePath,
      startTime: new Date(),
      wordsLearned: new Set<string>(),
    };

    console.log(`开始学习会话: ${subtitlePath}`);
  }

  /**
   * 结束当前学习会话
   */
  public endLearningSession(): void {
    // 如果没有进行中的会话，直接返回
    if (!this.currentSession.startTime || !this.currentSession.subtitle) {
      return;
    }

    const endTime = new Date();
    const sessionDuration =
      (endTime.getTime() - this.currentSession.startTime.getTime()) / (1000 * 60); // 转换为分钟

    // 获取今天的日期字符串 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // 获取现有的学习历史
    const history = this.store.get('learningHistory', []);

    // 查找今天的记录
    let todayRecord = history.find((record) => record.date === today);

    if (!todayRecord) {
      // 如果今天没有记录，创建一个新的
      todayRecord = {
        date: today,
        newWordsLearned: 0,
        totalTimeSpent: 0,
        sessions: [],
      };
      history.push(todayRecord);
    }

    // 更新今天的学习记录
    todayRecord.newWordsLearned += this.currentSession.wordsLearned.size;
    todayRecord.totalTimeSpent += sessionDuration;

    // 添加本次会话的记录
    todayRecord.sessions.push({
      subtitle: this.currentSession.subtitle,
      startTime: this.currentSession.startTime.toISOString(),
      endTime: endTime.toISOString(),
      wordsLearned: Array.from(this.currentSession.wordsLearned),
    });

    // 保存更新后的历史记录
    this.store.set('learningHistory', history);

    console.log(
      `结束学习会话: 学习了 ${
        this.currentSession.wordsLearned.size
      } 个新单词，持续 ${sessionDuration.toFixed(1)} 分钟`
    );

    // 重置当前会话
    this.currentSession = {
      subtitle: null,
      startTime: null,
      wordsLearned: new Set<string>(),
    };
  }
  /**
   * 导出已知单词列表
   */
  public async exportKnownWords(): Promise<string> {
    try {
      const knownWords = this.store.get('knownWords', []).sort();
      const downloadsPath = app.getPath('downloads');
      const exportPath = path.join(
        downloadsPath,
        `known-words-${new Date().toISOString().split('T')[0]}.txt`
      );

      // 将单词列表写入文件
      await fs.writeFile(exportPath, knownWords.join('\n'), 'utf-8');

      console.log(`已知单词已导出到: ${exportPath}`);
      return exportPath;
    } catch (error) {
      console.error('导出已知单词失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有学习过的单词（包含状态信息）
   * 支持IPC通信需要的方法
   */ public getAllWords(): LearnedWord[] {
    const knownWordsArray: string[] = this.store.get('knownWords', []);
    const misspelledWordsArray: string[] = this.store.get('misspelledWords', []);
    const result: LearnedWord[] = [];
    const knownWordsSet = new Set<string>(knownWordsArray);

    // 处理已知词
    for (const word of knownWordsArray) {
      result.push({
        word,
        status: WordStatus.KNOWN,
        reviewCount: 1, // 初始值
        notes: '',
      });
    }

    // 处理拼写错误的词
    for (const word of misspelledWordsArray) {
      if (!knownWordsSet.has(word)) {
        // 避免重复
        result.push({
          word,
          status: WordStatus.LEARNING,
          reviewCount: 0,
          notes: '拼写需要注意',
        });
      }
    }

    return result;
  }

  /**
   * 保存学习的单词
   * @param wordData 单词数据
   */
  public async saveWord(wordData: LearnedWord): Promise<void> {
    const { word, status } = wordData;
    const normalizedWord = word.toLowerCase().trim();

    if (status === WordStatus.KNOWN) {
      // 添加到已知单词列表
      this.addKnownWord(normalizedWord);
    } else if (status === WordStatus.LEARNING) {
      // 添加到学习中的单词
      const misspelledWords = new Set(this.store.get('misspelledWords', []));
      misspelledWords.add(normalizedWord);
      this.store.set('misspelledWords', Array.from(misspelledWords));
    }

    // 这里可以进一步扩展，例如保存更多的单词状态信息
    console.log(`保存单词 "${word}" 状态: ${status}`);
  }

  /**
   * 更新单词状态
   * @param word 单词
   * @param status 新状态
   */
  public async updateWordStatus(word: string, status: WordStatus): Promise<void> {
    const normalizedWord = word.toLowerCase().trim();

    // 根据新状态处理单词
    if (status === WordStatus.KNOWN) {
      // 添加到已知单词
      this.addKnownWord(normalizedWord);
    } else if (status === WordStatus.IGNORED) {
      // 如果是忽略，则从所有列表中移除
      const knownWords = new Set(this.store.get('knownWords', []));
      const misspelledWords = new Set(this.store.get('misspelledWords', []));

      knownWords.delete(normalizedWord);
      misspelledWords.delete(normalizedWord);

      this.store.set('knownWords', Array.from(knownWords));
      this.store.set('misspelledWords', Array.from(misspelledWords));
    } else {
      // 其他状态处理
      this.addMisspelledWord(normalizedWord);
    }

    console.log(`更新单词 "${word}" 状态为: ${status}`);
  }
}
