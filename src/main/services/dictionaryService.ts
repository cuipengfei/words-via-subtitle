import * as https from 'https';
import { DictionaryEntry } from '@shared/types';

// 定义从 https://dictionaryapi.dev/ 获取的数据结构
interface DictionaryAPIPronunciation {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: {
    name: string;
    url: string;
  };
}

interface DictionaryAPIDefinition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
  example?: string;
}

interface DictionaryAPIMeaning {
  partOfSpeech: string;
  definitions: DictionaryAPIDefinition[];
  synonyms: string[];
  antonyms: string[];
}

interface DictionaryAPIResponse {
  word: string;
  phonetic?: string;
  phonetics: DictionaryAPIPronunciation[];
  meanings: DictionaryAPIMeaning[];
  license: {
    name: string;
    url: string;
  };
  sourceUrls: string[];
}

// 词典服务类
export class DictionaryService {
  private readonly apiBaseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
  private readonly requestTimeout = 10000; // 10秒超时
  private readonly userAgent = 'WordsViaSubtitle/1.0';

  constructor() {
    // 在线词典服务，无需本地初始化
  }

  /**
   * 初始化词典服务
   */
  public async initialize(): Promise<void> {
    console.log('在线词典服务初始化完成');
  }
  /**
   * 查询单词
   */
  public async lookupWord(word: string): Promise<DictionaryEntry | null> {
    const normalizedWord = word.toLowerCase().trim();

    if (!normalizedWord) {
      return null;
    }
    try {
      console.log(`正在查询单词: ${normalizedWord}`);

      const requestUrl = `${this.apiBaseUrl}/${encodeURIComponent(normalizedWord)}`;
      console.log(`请求URL: ${requestUrl}`);

      // 创建AbortController用于超时控制
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.requestTimeout);

      const response = await fetch(requestUrl, {
        signal: abortController.signal,
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      });

      clearTimeout(timeoutId);

      console.log(`API响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.log(`单词 "${normalizedWord}" 未找到 (404)`);
          return null;
        }
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const apiData: DictionaryAPIResponse[] = await response.json();
      console.log(`API响应数据:`, JSON.stringify(apiData, null, 2));

      if (!apiData || apiData.length === 0) {
        console.log(`API返回空数据`);
        return null;
      }

      // 转换API响应为内部格式
      const result = this.convertApiResponseToDictionaryEntry(apiData);
      console.log(`转换后的词典条目:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`查询单词 "${normalizedWord}" 超时`);
        } else {
          console.error(`查询单词 "${normalizedWord}" 失败:`, error.message);
        }
      } else {
        console.error(`查询单词 "${normalizedWord}" 失败:`, error);
      }
      return null;
    }
  }

  /**
   * 将API响应转换为内部DictionaryEntry格式
   */
  private convertApiResponseToDictionaryEntry(
    apiResponse: DictionaryAPIResponse[]
  ): DictionaryEntry | null {
    if (!apiResponse || apiResponse.length === 0) {
      return null;
    }

    const primaryEntry = apiResponse[0];
    const word = primaryEntry.word;

    // 查找最佳音标文本（优先选择带音频的）
    let phonetic = primaryEntry.phonetic;
    if (!phonetic) {
      const phoneticWithAudio = primaryEntry.phonetics.find(p => p.audio);
      phonetic = phoneticWithAudio?.text || primaryEntry.phonetics[0]?.text;
    }

    const allExamples = new Set<string>();
    const allPartsOfSpeech = new Set<string>();
    const structuredTranslationLines: string[] = [];

    // 聚合所有条目和释义的数据
    apiResponse.forEach(entry => {
      entry.meanings.forEach(meaning => {
        allPartsOfSpeech.add(meaning.partOfSpeech);

        structuredTranslationLines.push(`[${meaning.partOfSpeech}]`);

        meaning.definitions.forEach((def, index) => {
          structuredTranslationLines.push(`${index + 1}. ${def.definition}`);
          if (def.example) {
            allExamples.add(def.example);
          }
        });
        structuredTranslationLines.push(''); // 为不同词性之间添加空行
      });
    });

    // 对于主'definition'，提供第一个最常见的释义
    const firstDefinition =
      primaryEntry.meanings[0]?.definitions[0]?.definition || 'No definition found.';

    return {
      word,
      phonetic: phonetic || undefined,
      definition: firstDefinition,
      translation: structuredTranslationLines.join('\n').trim(),
      examples: Array.from(allExamples).slice(0, 5), // 获取独特的例子并限制为5个
      partOfSpeech: Array.from(allPartsOfSpeech).join(', '),
    };
  }
}
