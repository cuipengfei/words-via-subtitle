import {
  DictionaryEntry,
  DictionaryAPIResponse,
  MeaningBlock,
  DefinitionInfo,
  ExampleInfo, // Import ExampleInfo
} from '@shared/types';
import { translate } from 'bing-translate-api';

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
      const result = await this.convertApiResponseToDictionaryEntry(apiData);
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
  private async convertApiResponseToDictionaryEntry(
    apiResponse: DictionaryAPIResponse[]
  ): Promise<DictionaryEntry | null> {
    if (!apiResponse || apiResponse.length === 0) {
      return null;
    }

    const primaryEntry = apiResponse[0];
    const word = primaryEntry.word;
    const phonetic = primaryEntry.phonetics.find((p) => p.text)?.text;

    // 1. 收集所有需要翻译的文本
    const allExamples = new Set<string>();
    const allPartsOfSpeech = new Set<string>();
    apiResponse.forEach((entry) => {
      entry.meanings.forEach((meaning) => {
        allPartsOfSpeech.add(meaning.partOfSpeech);
        meaning.definitions.forEach((def) => {
          if (def.example) {
            allExamples.add(def.example);
          }
        });
      });
    });

    const examplesToTranslate = Array.from(allExamples);
    const partsOfSpeechToTranslate = Array.from(allPartsOfSpeech);

    // 2. 并行执行所有翻译任务
    const [translatedExamples, translatedPartsOfSpeech, translatedWordHead] = await Promise.all([
      translate(examplesToTranslate.join('\n'), 'en', 'zh-Hans').catch((e) => {
        console.error('Failed to translate examples:', e);
        return null; // 如果失败则返回null
      }),
      translate(partsOfSpeechToTranslate.join('\n'), 'en', 'zh-Hans').catch((e) => {
        console.error('Failed to translate parts of speech:', e);
        return null; // 如果失败则返回null
      }),
      translate(word, 'en', 'zh-Hans').catch((e) => {
        console.error(`Failed to translate word "${word}":`, e);
        return null;
      }),
    ]);

    const exampleMap = new Map<string, string>();
    if (translatedExamples && translatedExamples.translation) {
      translatedExamples.translation
        .split('\n')
        .forEach((trans, i) => exampleMap.set(examplesToTranslate[i], trans));
    }

    const posMap = new Map<string, string>();
    if (translatedPartsOfSpeech && translatedPartsOfSpeech.translation) {
      translatedPartsOfSpeech.translation
        .split('\n')
        .forEach((trans, i) => posMap.set(partsOfSpeechToTranslate[i], trans));
    }

    const wordHeadTranslation =
      (translatedWordHead && translatedWordHead.translation) || '翻译失败';

    // 3. 构建完整的MeaningBlocks，包含释义的翻译
    const meaningBlocks: MeaningBlock[] = await Promise.all(
      apiResponse.flatMap((entry) =>
        entry.meanings.map(async (meaning) => {
          const definitionsToTranslate = meaning.definitions.map((d) => d.definition);
          let translatedDefinitions: string[] = [];

          try {
            const res = await translate(definitionsToTranslate.join('\n'), 'en', 'zh-Hans');
            if (res && res.translation) {
              translatedDefinitions = res.translation.split('\n');
            }
          } catch (e) {
            console.error(`Failed to translate definitions for ${meaning.partOfSpeech}:`, e);
          }

          const definitionInfos: DefinitionInfo[] = meaning.definitions.map((def, i) => ({
            english: def.definition,
            chinese: translatedDefinitions[i] || '翻译失败',
          }));

          return {
            partOfSpeech: meaning.partOfSpeech,
            chinesePartOfSpeech: posMap.get(meaning.partOfSpeech) || '翻译失败',
            definitions: definitionInfos,
          };
        })
      )
    );

    const finalExamples: ExampleInfo[] = examplesToTranslate.map((ex) => ({
      english: ex,
      chinese: exampleMap.get(ex) || '翻译失败',
    }));

    const finalEntry: DictionaryEntry = {
      word,
      wordHeadTranslation,
      phonetic: phonetic || undefined,
      meanings: meaningBlocks,
      examples: finalExamples.slice(0, 5), // 限制最终例句数量
    };

    console.log(
      '[DictionaryService] Final dictionary entry constructed:',
      JSON.stringify(finalEntry, null, 2)
    );

    return finalEntry;
  }
}
