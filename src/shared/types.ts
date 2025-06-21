export interface SubtitleEntry {
  id: number;
  startTime: number; // 毫秒
  endTime: number; // 毫秒
  text: string;
}

export interface WordOccurrence {
  startTime: number; // 毫秒
  endTime: number; // 毫秒
  context: string; // 单词所在的字幕文本
  subtitleId: number;
}

export interface Word {
  original: string;
  count: number;
  occurrences?: WordOccurrence[]; // 单词在字幕中出现的所有位置
}

export interface ParseResult {
  success: boolean;
  data?: {
    entries: SubtitleEntry[];
    words: Word[];
  };
  error?: string;
}

// Represents the structure of the response from the Free Dictionary API
export interface DictionaryAPIResponse {
  word: string;
  phonetics: {
    text: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

export interface DefinitionInfo {
  english: string;
  chinese: string;
}

export interface MeaningBlock {
  partOfSpeech: string;
  chinesePartOfSpeech: string;
  definitions: DefinitionInfo[];
}

export interface ExampleInfo {
  english: string;
  chinese: string;
}

export interface DictionaryEntry {
  word: string;
  wordHeadTranslation?: string;
  phonetic?: string;
  meanings: MeaningBlock[];
  examples: ExampleInfo[];
}

export interface WordData {
  word: string;
  count: number;
}
