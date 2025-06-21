export interface SubtitleEntry {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface Word {
  original: string;
  count: number;
}

export interface ParseResult {
  success: boolean;
  data?: {
    entries: SubtitleEntry[];
    words: Word[];
  };
  error?: string;
}

// 词典条目类型
export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  definition: string;
  translation: string;
  examples?: string[];
  partOfSpeech?: string;
}
