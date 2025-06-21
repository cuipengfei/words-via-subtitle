import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import type { SubtitleEntry, Word, DictionaryEntry } from '@shared/types';
import {
  FileText,
  BookOpenText,
  List,
  MessageCircleQuestion,
  FolderOpen,
  Search,
  ChevronRight,
  GripVertical,
} from 'lucide-react';

// Resizable Panel Hook
const useResizable = (initialWidth: number = 320) => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = width;

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX;
        const newWidth = Math.max(200, Math.min(600, startWidth + diff));
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [width]
  );

  return { width, isResizing, containerRef, startResize };
};

// Skeleton Loader Component
const DefinitionSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
    <div className="space-y-4 pt-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
    <div className="space-y-4 pt-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8">
    <Icon size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-center text-sm max-w-sm">{subtitle}</p>
  </div>
);

export default function Home() {
  const [subtitleEntries, setSubtitleEntries] = useState<SubtitleEntry[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<DictionaryEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { width: leftPanelWidth, isResizing, startResize } = useResizable(360);

  const filteredWords = words.filter((word) =>
    word.original.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = async () => {
    setError(null);
    setSubtitleEntries([]);
    setWords([]);
    setSelectedFileName(null);
    setSelectedWord(null);
    setWordDefinition(null);
    setSearchTerm('');

    try {
      const filePath = await window.electronAPI.openSubtitleFile();
      if (filePath) {
        const fileName = filePath.split('\\').pop()?.split('/').pop() || filePath;
        setSelectedFileName(fileName);
        const result = await window.electronAPI.parseSubtitleFile(filePath);
        if (result.success && result.data) {
          setSubtitleEntries(result.data.entries);
          setWords(result.data.words);
        } else {
          setError(result.error || '未知解析错误');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleWordClick = async (word: string) => {
    if (selectedWord === word) return;
    setSelectedWord(word);
    setIsLookingUp(true);
    setWordDefinition(null);
    try {
      const definition = await window.electronAPI.lookupWord(word);
      setWordDefinition(definition);
    } catch (err) {
      setError(`查询单词 "${word}" 失败`);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <>
      <Head>
        <title>字幕学单词</title>
        <meta name="description" content="通过字幕学习英语单词" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* VS Code Style Layout */}
      <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        {/* Top Toolbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">字幕学单词</h1>
            {selectedFileName && (
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <FileText size={16} />
                <span>{selectedFileName}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleFileSelect}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FolderOpen size={16} />
            <span>选择字幕文件</span>
          </button>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-3 mx-4 mt-2 rounded-r-lg">
            <div className="flex items-center">
              <strong className="font-medium">错误:</strong>
              <span className="ml-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - File Explorer & Word List */}
          <div
            className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col"
            style={{ width: leftPanelWidth }}
          >
            {/* Word List Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <List size={18} className="text-indigo-500" />
                <h2 className="font-semibold text-slate-700 dark:text-slate-200">
                  单词列表 {words.length > 0 && `(${words.length})`}
                </h2>
              </div>

              {/* Search Bar */}
              {words.length > 0 && (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="搜索单词..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Word List */}
            <div className="flex-1 overflow-y-auto">
              {filteredWords.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredWords.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordClick(word.original)}
                      className={`w-full flex justify-between items-center p-3 rounded-lg text-left transition-all duration-150 ${
                        selectedWord === word.original
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{word.original}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
                          {word.count}
                        </span>
                        {selectedWord === word.original && (
                          <ChevronRight size={14} className="text-indigo-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : words.length === 0 ? (
                <EmptyState
                  icon={FolderOpen}
                  title="暂无单词"
                  subtitle="请先选择一个字幕文件来解析单词列表"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="没有找到匹配的单词"
                  subtitle="尝试调整搜索关键词"
                />
              )}
            </div>
          </div>

          {/* Resizer */}
          <div
            className={`w-1 bg-slate-200 dark:bg-slate-700 cursor-col-resize hover:bg-indigo-400 dark:hover:bg-indigo-600 transition-colors flex items-center justify-center group ${
              isResizing ? 'bg-indigo-500' : ''
            }`}
            onMouseDown={startResize}
          >
            <GripVertical
              size={12}
              className="text-slate-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Right Panel - Definition */}
          <div className="flex-1 bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
            {/* Definition Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <BookOpenText size={18} className="text-indigo-500" />
                <h2 className="font-semibold text-slate-700 dark:text-slate-200">单词释义</h2>
                {selectedWord && (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    - {selectedWord}
                  </span>
                )}
              </div>
            </div>

            {/* Definition Content */}
            <div className="flex-1 overflow-y-auto">
              {isLookingUp ? (
                <DefinitionSkeleton />
              ) : wordDefinition ? (
                <div className="p-6 space-y-8">
                  <div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white">
                      {wordDefinition.word}
                      {wordDefinition.wordHeadTranslation && (
                        <span className="text-2xl text-indigo-600 dark:text-indigo-400 font-semibold ml-4">
                          {wordDefinition.wordHeadTranslation}
                        </span>
                      )}
                    </h3>
                    {wordDefinition.phonetic && (
                      <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                        {wordDefinition.phonetic}
                      </p>
                    )}
                  </div>

                  {wordDefinition.meanings.map((meaning, index) => (
                    <div
                      key={index}
                      className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <h4 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                        {meaning.partOfSpeech}
                      </h4>
                      <p className="text-md font-medium text-indigo-500 dark:text-indigo-300 mb-4">
                        {meaning.chinesePartOfSpeech}
                      </p>
                      <ul className="space-y-4">
                        {meaning.definitions.map((def, i) => (
                          <li
                            key={i}
                            className="pl-4 border-l-4 border-indigo-200 dark:border-indigo-800"
                          >
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {def.english}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{def.chinese}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {wordDefinition.examples.length > 0 && (
                    <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                        例句
                      </h4>
                      <ul className="space-y-4">
                        {wordDefinition.examples.map((example, i) => (
                          <li
                            key={i}
                            className="pl-4 border-l-4 border-slate-200 dark:border-slate-600"
                          >
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {example.english}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                              {example.chinese}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={MessageCircleQuestion}
                  title="选择一个单词"
                  subtitle="从左侧单词列表中选择一个单词来查看其详细释义和例句"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
