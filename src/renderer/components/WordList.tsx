import { Search, List } from 'lucide-react';
import type { Word } from '@shared/types';
import { EmptyState, Badge } from './UI';

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
      {/* 面板头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-900 dark:text-gray-100">
          <List size={20} className="text-indigo-600" />
          单词列表
        </h2>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <input
            type="text"
            placeholder="搜索单词..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 h-9 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-150 text-sm placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>
      
      {/* 列表内容区域 - 独立滚动 */}
      <div className="flex-1 overflow-y-auto">
        {filteredWords.length === 0 ? (
          <EmptyState
            icon={<Search size={32} />}
            title="未找到匹配的单词"
            subtitle="尝试调整搜索关键词或检查拼写"
          />
        ) : (
          filteredWords.map((word) => (
            <div
              key={word.original}
              onClick={() => onSelectWord(word.original)}
              className={`group flex justify-between items-center px-4 py-3 cursor-pointer transition-all duration-150 ${
                selectedWord === word.original
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-900 dark:text-indigo-100'
                  : 'border-l-4 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-l-gray-300 dark:hover:border-l-gray-600'
              }`}
            >
              <span className={`font-semibold transition-colors ${
                selectedWord === word.original 
                  ? 'text-indigo-900 dark:text-indigo-100' 
                  : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
              }`}>
                {word.original}
              </span>
              <Badge 
                variant={selectedWord === word.original ? 'primary' : 'default'}
                size="sm"
              >
                {word.count}次
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
