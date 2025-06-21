import { ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { app } from 'electron';
import { TranslationResult, Definition } from '@/shared/ipc';

// 本地词典数据接口
interface DictionaryEntry {
  word: string;
  phonetic?: string;
  definition: string;
  translation: string;
  examples?: string[];
  partOfSpeech?: string;
}

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

    // 注册IPC处理程序
    ipcMain.handle('lookup-word', async (_, word: string) => {
      return this.lookupWord(word);
    });

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
        // 如果文件不存在，加载内置的基本词典
        const builtInDictionaryPath = path.join(
          app.getAppPath(),
          'assets',
          'built-in-dictionary.json'
        );
        try {
          // 尝试复制内置词典
          const builtInData = await fs.readFile(builtInDictionaryPath, 'utf-8');
          await fs.writeFile(this.localDictionaryPath, builtInData, 'utf-8');
          console.log('已创建本地词典文件');
        } catch (err) {
          console.error('无法创建本地词典文件:', err);
          // 创建一个空的词典文件
          await fs.writeFile(this.localDictionaryPath, JSON.stringify([]), 'utf-8');
        }
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

    // 如果本地词典没有，尝试在线查询 (将在后续实现)
    // 这里将添加在线词典API调用

    // 暂时返回null
    return null;
  }

  /**
   * 翻译单词
   * @param word 要翻译的单词
   * @returns 翻译结果
   */
  public async translate(word: string): Promise<TranslationResult> {
    const normalizedWord = word.toLowerCase().trim();
    const entry = await this.lookupWord(normalizedWord);

    // 构建翻译结果
    const result: TranslationResult = {
      word: word,
      translations: [],
      definitions: [],
    };

    if (entry) {
      result.translations = [entry.translation];
      result.phonetic = entry.phonetic;

      // 处理定义
      const definition: Definition = {
        partOfSpeech: entry.partOfSpeech || 'unknown',
        meaning: entry.definition,
        examples: entry.examples || [],
      };

      result.definitions = [definition];
      result.examples = entry.examples || [];
    } else {
      // 如果本地词典未找到，尝试在线API（后续实现）
      console.log(`未找到单词 "${word}" 的翻译，将在未来版本支持在线查询`);
    }

    return result;
  }

  /**
   * 获取单词的详细定义
   * @param word 要查询的单词
   * @returns 详细定义结果
   */
  public async getDefinition(word: string): Promise<TranslationResult> {
    // 与translate方法基本相同，但可以提供更详细的信息
    // 当前版本暂时复用translate方法
    return this.translate(word);
  }

  /**
   * 添加或更新词典条目
   */
  public async addOrUpdateEntry(entry: DictionaryEntry): Promise<void> {
    const normalizedWord = entry.word.toLowerCase().trim();

    // 更新内存中的条目
    this.localDictionary.set(normalizedWord, entry);

    // 保存到文件
    await this.saveLocalDictionary();
  }

  /**
   * 保存本地词典到文件
   */
  private async saveLocalDictionary(): Promise<void> {
    try {
      const entries = Array.from(this.localDictionary.values());
      await fs.writeFile(this.localDictionaryPath, JSON.stringify(entries, null, 2), 'utf-8');
      console.log('本地词典已保存');
    } catch (error) {
      console.error('保存本地词典失败:', error);
    }
  }
}
