import { Search, List } from 'lucide-react';
import type { Word } from '@shared/types';

export function WordList({
  words,
  selectedWord,
  searchTerm,
  onSearch,
  onSelectWord,
}: {
  words: Word[];
  selectedWord: string | null;
  searchTerm: string;
  onSearch: (term: string) => void;
  onSelectWord: (word: string) => void;
}) {
  const filteredWords = words.filter((word) =>
    word.original.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
          <List size={20} />
          单词列表
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索单词..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredWords.map((word) => (
          <div
            key={word.original}
            onClick={() => onSelectWord(word.original)}
            className={`flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-800 transition-colors ${
              selectedWord === word.original
                ? 'bg-indigo-100 dark:bg-indigo-900/50 border-l-4 border-indigo-500'
                : 'border-l-4 border-transparent'
            }`}
          >
            <span className="font-bold">{word.original}</span>
            <span className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {word.count}次
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
