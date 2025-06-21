import { useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TopBar } from '@/renderer/components/TopBar';
import { WordList, WordListRef } from '@/renderer/components/WordList';
import { WordDefinition } from '@/renderer/components/WordDefinition';
import { VideoPlayer, VideoPlayerRef } from '@/renderer/components/VideoPlayer';
import { SubtitleOverlay } from '@/renderer/components/SubtitleOverlay';
import { StatusBar } from '@/renderer/components/StatusBar';
import { useKeyboardShortcuts } from '@/renderer/hooks/useKeyboardShortcuts';
import type { SubtitleEntry, Word, DictionaryEntry } from '@shared/types';
import { FolderOpen } from 'lucide-react';

export default function AppPage() {
  const [subtitleEntries, setSubtitleEntries] = useState<SubtitleEntry[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<DictionaryEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 视频相关状态
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // 引用
  const wordListRef = useRef<WordListRef>(null);
  const videoPlayerRef = useRef<VideoPlayerRef>(null);

  const handleFileSelect = async () => {
    setError(null);
    setSubtitleEntries([]);
    setWords([]);
    setSelectedFileName(null);
    setSelectedWord(null);
    setWordDefinition(null);

    const filePath = await window.electronAPI.openSubtitleFile();
    if (!filePath) {
      // User cancelled the dialog
      return;
    }

    setSelectedFileName(filePath.split(/[\\/]/).pop() || null);
    const parseResult = await window.electronAPI.parseSubtitleFile(filePath);
    if (parseResult.success && parseResult.data) {
      setSubtitleEntries(parseResult.data.entries);
      setWords(parseResult.data.words);
    } else {
      setError(parseResult.error || 'Failed to parse subtitle file.');
    }
  };

  const handleVideoSelect = async () => {
    setError(null);

    const filePath = await window.electronAPI.openVideoFile();
    if (!filePath) {
      return;
    }

    setVideoFileName(filePath.split(/[\\/]/).pop() || null);
    // 创建本地文件URL用于视频播放
    setVideoSrc(`file://${filePath}`);
  };

  const handleVideoTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleVideoLoadedMetadata = (duration: number) => {
    setVideoDuration(duration);
  };

  const handleWordClickFromSubtitle = (word: string, timestamp: number) => {
    handleWordSelect(word);
    // 可以选择是否跳转到对应时间点
    setCurrentTime(timestamp / 1000);
  };

  const handleSubtitleClick = (timestamp: number) => {
    setCurrentTime(timestamp);
  };

  // 单词导航功能
  const navigateToWord = (direction: 'next' | 'prev') => {
    if (words.length === 0) return;

    const currentIndex = selectedWord ? words.findIndex((w) => w.original === selectedWord) : -1;
    let newIndex: number;

    if (direction === 'next') {
      newIndex = currentIndex < words.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : words.length - 1;
    }

    const newWord = words[newIndex];
    if (newWord) {
      handleWordSelect(newWord.original);
    }
  };

  // 键盘快捷键配置
  useKeyboardShortcuts({
    onOpenSubtitle: handleFileSelect,
    onOpenVideo: handleVideoSelect,
    onTogglePlay: () => videoPlayerRef.current?.togglePlay(),
    onSkipBackward: () => videoPlayerRef.current?.skipBackward(),
    onSkipForward: () => videoPlayerRef.current?.skipForward(),
    onFocusSearch: () => wordListRef.current?.focusSearch(),
    onNextWord: () => navigateToWord('next'),
    onPrevWord: () => navigateToWord('prev'),
    onToggleFullscreen: () => videoPlayerRef.current?.toggleFullscreen(),
  });

  const handleWordSelect = useCallback(async (word: string) => {
    setSelectedWord(word);
    setIsLookingUp(true);
    setWordDefinition(null);
    try {
      const definition = await window.electronAPI.lookupWord(word);
      if (definition) {
        setWordDefinition(definition);
      } else {
        setError(`Could not find definition for "${word}"`);
        setWordDefinition(null);
      }
    } catch (e: any) {
      setError(e.message);
      setWordDefinition(null);
    } finally {
      setIsLookingUp(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>字幕学单词</title>
      </Head>
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden min-w-[1000px]">
        <TopBar
          selectedFileName={selectedFileName}
          videoFileName={videoFileName}
          onOpenFile={handleFileSelect}
          onOpenVideo={handleVideoSelect}
        />
        <div className="flex-1 overflow-hidden">
          {/* 三栏布局 */}
          <div className="h-full">
            <PanelGroup direction="horizontal">
              {/* 左栏：单词列表 */}
              <Panel defaultSize={25} minSize={20} maxSize={40}>
                <div className="animate-slide-in-left h-full overflow-hidden">
                  {words.length > 0 ? (
                    <WordList
                      ref={wordListRef}
                      words={words}
                      selectedWord={selectedWord}
                      searchTerm={searchTerm}
                      onSearch={setSearchTerm}
                      onSelectWord={handleWordSelect}
                      onWordTimeClick={handleSubtitleClick}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <FolderOpen size={32} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        等待字幕文件
                      </h3>
                      <p className="text-center text-sm leading-relaxed max-w-sm">
                        使用顶部工具栏选择字幕文件，系统将自动提取单词并统计词频。
                      </p>
                    </div>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 cursor-col-resize group relative">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-400 transition-colors duration-200 rounded-full"></div>
              </PanelResizeHandle>

              {/* 中栏：视频播放器 */}
              <Panel defaultSize={50} minSize={35} maxSize={65}>
                <div className="h-full bg-gray-50 dark:bg-gray-950 relative animate-scale-in overflow-hidden">
                  <VideoPlayer
                    ref={videoPlayerRef}
                    videoSrc={videoSrc}
                    currentTime={currentTime}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className="h-full"
                  />

                  {/* 字幕覆盖层 */}
                  {videoSrc && subtitleEntries.length > 0 && (
                    <SubtitleOverlay
                      subtitles={subtitleEntries}
                      currentTime={currentTime}
                      onWordClick={handleWordClickFromSubtitle}
                    />
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 cursor-col-resize group relative">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-400 transition-colors duration-200 rounded-full"></div>
              </PanelResizeHandle>

              {/* 右栏：单词释义 */}
              <Panel defaultSize={25} minSize={20} maxSize={40}>
                <div className="animate-slide-in-right h-full overflow-hidden">
                  <WordDefinition
                    definition={wordDefinition}
                    isLoading={isLookingUp}
                    selectedWord={selectedWord}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </div>

        {/* 状态栏 */}
        <StatusBar
          totalWords={words.length}
          selectedWord={selectedWord}
          currentTime={currentTime}
          videoDuration={videoDuration}
        />
        {error && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md z-50 animate-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">操作失败</div>
                <div className="text-sm leading-relaxed">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
