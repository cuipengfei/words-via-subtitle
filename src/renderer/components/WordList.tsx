import { Search, List, Clock } from 'lucide-react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { Word } from '@shared/types';
import { Badge } from './UI';

export interface WordListRef {
  focusSearch: () => void;
}

interface WordListProps {
  words: Word[];
  selectedWord: string | null;
  searchTerm: string;
  onSearch: (term: string) => void;
  onSelectWord: (word: string) => void;
  onWordTimeClick?: (timestamp: number) => void;
}

export const WordList = forwardRef<WordListRef, WordListProps>(
  ({ words, selectedWord, searchTerm, onSearch, onSelectWord, onWordTimeClick }, ref) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus();
      },
    }));

    // 过滤和排序单词（按频率排序）
    const filteredAndSortedWords = words
      .filter((word) => word.original.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => b.count - a.count);

    // 格式化时间显示
    const formatTime = (timeMs: number) => {
      const totalSeconds = Math.floor(timeMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    return (
      <div
        style={{
          height: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        className="bg-white dark:bg-gray-900"
      >
        {/* 面板头部 - 固定不滚动 */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <List size={20} className="text-indigo-600" />
              单词列表
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {filteredAndSortedWords.length} 个单词
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="搜索单词..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 h-9 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-150 text-sm placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
        {/* 列表内容区域 - 独立滚动 */}
        <div
          style={{ height: 'calc(100% - 120px)', overflowY: 'auto', padding: '8px' }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          {filteredAndSortedWords.length === 0 ? (
            <div className="space-y-2">
              {/* 添加测试数据来验证滚动 */}
              {Array.from({ length: 50 }, (_, i) => (
                <div
                  key={`test-${i}`}
                  className="group border-l-4 border-transparent hover:bg-white dark:hover:bg-gray-700 hover:border-l-gray-300 dark:hover:border-l-gray-500 transition-all duration-150 mb-1 rounded-r-md bg-white dark:bg-gray-900"
                >
                  <div className="flex justify-between items-center px-4 py-3 cursor-pointer">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                      test-word-{i + 1}
                    </span>
                    <Badge variant="default" size="sm">
                      {(i % 20) + 1}次
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            filteredAndSortedWords.map((word) => (
              <div
                key={word.original}
                className={`group border-l-4 transition-all duration-150 mb-1 rounded-r-md ${
                  selectedWord === word.original
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-900 dark:text-indigo-100'
                    : 'border-transparent hover:bg-white dark:hover:bg-gray-700 hover:border-l-gray-300 dark:hover:border-l-gray-500 bg-white dark:bg-gray-900'
                }`}
              >
                {/* 主要单词信息 */}
                <div
                  onClick={() => onSelectWord(word.original)}
                  className="flex justify-between items-center px-4 py-3 cursor-pointer"
                >
                  <span
                    className={`font-semibold transition-colors ${
                      selectedWord === word.original
                        ? 'text-indigo-900 dark:text-indigo-100'
                        : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
                    }`}
                  >
                    {word.original}
                  </span>
                  <Badge variant={selectedWord === word.original ? 'primary' : 'default'} size="sm">
                    {word.count}次
                  </Badge>
                </div>

                {/* 时间信息（如果有的话） */}
                {word.occurrences && word.occurrences.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-1">
                      {word.occurrences.slice(0, 3).map((occurrence, index) => (
                        <button
                          key={index}
                          onClick={() => onWordTimeClick?.(occurrence.startTime)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center gap-1 ${
                            selectedWord === word.original
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Clock size={10} />
                          {formatTime(occurrence.startTime)}
                        </button>
                      ))}
                      {word.occurrences.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                          +{word.occurrences.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);

WordList.displayName = 'WordList';
