import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import type { DictionaryEntry } from '../../shared/types';

// 词典服务类
export class DictionaryService {
  private localDictionary: Map<string, DictionaryEntry> = new Map();
  private dictionaryLoaded = false;
  private readonly localDictionaryPath: string;

  constructor() {
    // 设置本地词典文件路径
    this.localDictionaryPath = path.join(app.getPath('userData'), 'dictionary.json');
  }

  /**
   * 初始化词典服务
   */
  public async initialize(): Promise<void> {
    // 加载本地词典
    await this.loadLocalDictionary();
    console.log('词典服务初始化完成');
  }

  /**
   * 加载本地词典文件
   */
  private async loadLocalDictionary(): Promise<void> {
    try {
      // 检查文件是否存在
      try {
        await fs.access(this.localDictionaryPath);
      } catch {
        // 如果文件不存在，创建一个包含示例数据的基本词典
        const basicDictionary: DictionaryEntry[] = [
          {
            word: 'hello',
            phonetic: '/həˈloʊ/',
            definition: 'Used as a greeting or to begin a phone conversation.',
            translation: '你好；喂（用于打招呼或开始电话对话）',
            examples: ['Hello, how are you?', 'Hello, this is John speaking.'],
            partOfSpeech: 'interjection',
          },
          {
            word: 'world',
            phonetic: '/wɜːrld/',
            definition: 'The earth, together with all of its countries and peoples.',
            translation: '世界；地球',
            examples: ['The world is full of wonders.', 'She traveled around the world.'],
            partOfSpeech: 'noun',
          },
          {
            word: 'learn',
            phonetic: '/lɜːrn/',
            definition:
              'Gain or acquire knowledge of or skill in (something) by study, experience, or being taught.',
            translation: '学习；学会',
            examples: ['I want to learn Spanish.', 'Children learn quickly.'],
            partOfSpeech: 'verb',
          },
        ];

        await fs.writeFile(
          this.localDictionaryPath,
          JSON.stringify(basicDictionary, null, 2),
          'utf-8'
        );
        console.log('已创建基本词典文件');
      }

      // 读取词典文件
      const data = await fs.readFile(this.localDictionaryPath, 'utf-8');
      const entries: DictionaryEntry[] = JSON.parse(data);

      // 加载到内存中的Map
      entries.forEach((entry) => {
        this.localDictionary.set(entry.word.toLowerCase(), entry);
      });

      this.dictionaryLoaded = true;
      console.log(`已加载${this.localDictionary.size}个词典条目`);
    } catch (error) {
      console.error('加载本地词典失败:', error);
      this.dictionaryLoaded = false;
    }
  }

  /**
   * 查询单词
   */
  public async lookupWord(word: string): Promise<DictionaryEntry | null> {
    const normalizedWord = word.toLowerCase().trim();

    // 先从本地词典中查询
    const localEntry = this.localDictionary.get(normalizedWord);
    if (localEntry) {
      return localEntry;
    }

    // 如果本地词典没有，返回null
    // 将来可以在这里添加在线词典API调用
    return null;
  }
}
