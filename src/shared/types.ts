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
  definitions: DefinitionInfo[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: MeaningBlock[];
  examples: string[];
}

export interface WordData {
  word: string;
  count: number;
}
