import type { ParseResult, DictionaryEntry } from '@shared/types';

declare global {
  interface Window {
    electronAPI: {
      openSubtitleFile: () => Promise<string | null>;
      parseSubtitleFile: (filePath: string) => Promise<ParseResult>;
      lookupWord: (word: string) => Promise<DictionaryEntry | null>;
      openVideoFile: () => Promise<string | null>;
    };
  }
}
