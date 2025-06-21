import {
  DictionaryEntry,
  DictionaryAPIResponse,
  MeaningBlock,
  DefinitionInfo,
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
      console.log('[DictionaryService] API response is empty or null.');
      return null;
    }
    console.log('[DictionaryService] Received API response:', JSON.stringify(apiResponse, null, 2));

    const primaryEntry = apiResponse[0];
    const word = primaryEntry.word;
    const phonetic = primaryEntry.phonetics.find((p) => p.text)?.text;

    const allExamples = new Set<string>();
    const meaningBlocks: MeaningBlock[] = [];

    for (const entry of apiResponse) {
      for (const meaning of entry.meanings) {
        const definitionsToTranslate: string[] = meaning.definitions.map((def) => def.definition);

        meaning.definitions.forEach((def) => {
          if (def.example) {
            allExamples.add(def.example);
          }
        });

        console.log(
          `[DictionaryService] Text to translate for part of speech "${
            meaning.partOfSpeech
          }":\n${definitionsToTranslate.join('\n')}`
        );

        try {
          const res = await translate(definitionsToTranslate.join('\n'), 'en', 'zh-Hans');
          console.log(
            `[DictionaryService] Translation successful for "${meaning.partOfSpeech}". Raw response:`,
            JSON.stringify(res, null, 2)
          );

          const translatedDefinitions = res?.translation?.split('\n') || [];

          const definitionInfos: DefinitionInfo[] = definitionsToTranslate.map((englishDef, i) => ({
            english: englishDef,
            chinese: translatedDefinitions[i] || '翻译不可用',
          }));

          meaningBlocks.push({
            partOfSpeech: meaning.partOfSpeech,
            definitions: definitionInfos,
          });
        } catch (err) {
          console.error(
            `[DictionaryService] Translation failed for "${meaning.partOfSpeech}"`,
            err
          );
          meaningBlocks.push({
            partOfSpeech: meaning.partOfSpeech,
            definitions: definitionsToTranslate.map((englishDef) => ({
              english: englishDef,
              chinese: '翻译失败',
            })),
          });
        }
      }
    }

    const finalEntry: DictionaryEntry = {
      word,
      phonetic: phonetic || undefined,
      meanings: meaningBlocks,
      examples: Array.from(allExamples).slice(0, 5),
    };

    console.log(
      '[DictionaryService] Final dictionary entry constructed:',
      JSON.stringify(finalEntry, null, 2)
    );

    return finalEntry;
  }
}
