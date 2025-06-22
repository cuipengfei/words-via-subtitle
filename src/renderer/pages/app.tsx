import { useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { TopBar } from '@/renderer/components/TopBar';
import { WordList, WordListRef } from '@/renderer/components/WordList';
import { WordDefinition } from '@/renderer/components/WordDefinition';
import {
  VideoPanelContainer,
  VideoPanelContainerRef,
} from '@/renderer/components/VideoPanelContainer';
// import { SubtitleOverlay } from '@/renderer/components/SubtitleOverlay';
import { StatusBar } from '@/renderer/components/StatusBar';
import { useKeyboardShortcuts } from '@/renderer/hooks/useKeyboardShortcuts';
import type { SubtitleEntry, Word, DictionaryEntry } from '@shared/types';

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
  const videoPlayerRef = useRef<VideoPanelContainerRef>(null);

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
  // 文件名匹配函数
  const matchSubtitleFile = async (videoFilePath: string) => {
    // 获取视频文件名（不含扩展名）和路径
    const lastSlashIndex = Math.max(
      videoFilePath.lastIndexOf('/'),
      videoFilePath.lastIndexOf('\\')
    );
    const filePath = videoFilePath.substring(0, lastSlashIndex);
    const fileNameWithExt = videoFilePath.substring(lastSlashIndex + 1);
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.lastIndexOf('.'));

    // 尝试查找同名字幕文件（支持多种扩展名）
    const extensions = ['.srt', '.ass', '.ssa', '.vtt'];

    for (const ext of extensions) {
      const subtitlePath = `${filePath}/${fileName}${ext}`;
      // 检查文件是否存在
      try {
        const exists = await window.electronAPI.checkFileExists(subtitlePath);
        if (exists) {
          return subtitlePath;
        }
      } catch (error) {
        console.error('检查字幕文件出错:', error);
      }
    }
    return null;
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

    // 尝试自动匹配字幕文件
    try {
      const subtitlePath = await matchSubtitleFile(filePath);
      if (subtitlePath) {
        // 自动加载匹配的字幕文件
        setSelectedFileName(subtitlePath.split(/[\\/]/).pop() || null);
        const parseResult = await window.electronAPI.parseSubtitleFile(subtitlePath);
        if (parseResult.success && parseResult.data) {
          setSubtitleEntries(parseResult.data.entries);
          setWords(parseResult.data.words);
        } else {
          console.warn('自动匹配的字幕文件解析失败');
        }
      }
    } catch (error) {
      console.error('自动匹配字幕文件出错:', error);
    }
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
      <div className="h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-w-[1000px] overflow-hidden">
        <TopBar
          selectedFileName={selectedFileName}
          videoFileName={videoFileName}
          onOpenFile={handleFileSelect}
          onOpenVideo={handleVideoSelect}
        />

        {/* 三栏布局 - 使用成功的滚动模式 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: 'calc(100vh - 50px)',
            width: '100%',
            gap: '8px',
            padding: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          {/* 左栏：单词列表 */}
          <div
            style={{
              width: '300px',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <WordList
              ref={wordListRef}
              words={words}
              selectedWord={selectedWord}
              searchTerm={searchTerm}
              onSearch={setSearchTerm}
              onSelectWord={handleWordSelect}
              onWordTimeClick={handleSubtitleClick}
            />
          </div>

          {/* 中栏：视频播放器 */}
          <div
            style={{
              flex: 1,
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
              position: 'relative',
            }}
          >
            {videoSrc ? (
              <VideoPanelContainer
                ref={videoPlayerRef}
                videoSrc={videoSrc}
                subtitles={subtitleEntries}
                onWordClick={handleWordClickFromSubtitle}
                className="h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-gray-400">
                <button
                  onClick={handleVideoSelect}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
                >
                  <span>选择视频文件</span>
                </button>
              </div>
            )}
          </div>
          {/* 右栏：单词释义 */}
          <div
            style={{
              width: '300px',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <WordDefinition
              definition={wordDefinition}
              isLoading={isLookingUp}
              selectedWord={selectedWord}
            />
          </div>
        </div>

        {/* 状态栏 */}
        <StatusBar
          totalWords={words.length}
          selectedWord={selectedWord}
          currentTime={currentTime}
          videoDuration={videoDuration}
        />
      </div>
    </>
  );
}
