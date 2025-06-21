import React from 'react';
import type { SubtitleEntry } from '@shared/types';

interface SubtitleOverlayProps {
  subtitles: SubtitleEntry[];
  currentTime: number;
  onWordClick?: (word: string, timestamp: number) => void;
  className?: string;
}

export function SubtitleOverlay({
  subtitles,
  currentTime,
  onWordClick,
  className = '',
}: SubtitleOverlayProps) {
  // 查找当前时间对应的字幕
  const getCurrentSubtitle = () => {
    return subtitles.find(
      (subtitle) =>
        currentTime >= subtitle.startTime / 1000 && currentTime <= subtitle.endTime / 1000
    );
  };

  const currentSubtitle = getCurrentSubtitle();

  // 将字幕文本分割成单词，用于点击交互
  const renderSubtitleText = (text: string) => {
    // 简单的单词分割，保留标点符号
    const words = text.split(/(\s+|[.,!?;:])/);
    
    return words.map((word, index) => {
      const trimmedWord = word.trim().toLowerCase().replace(/[.,!?;:]/g, '');
      
      // 如果是空白字符或标点符号，直接返回
      if (!trimmedWord || /^\s+$/.test(word) || /^[.,!?;:]+$/.test(word)) {
        return <span key={index}>{word}</span>;
      }

      // 如果是英文单词，添加点击交互
      if (/^[a-zA-Z]+$/.test(trimmedWord)) {
        return (
          <span
            key={index}
            className="cursor-pointer hover:text-indigo-300 hover:underline transition-colors duration-150"
            onClick={() => onWordClick?.(trimmedWord, currentSubtitle?.startTime || 0)}
          >
            {word}
          </span>
        );
      }

      return <span key={index}>{word}</span>;
    });
  };

  if (!currentSubtitle) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-4xl px-6 ${className}`}
    >
      <div className="bg-black/80 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg">
        <p className="text-white text-lg leading-relaxed text-center font-medium">
          {renderSubtitleText(currentSubtitle.text)}
        </p>
      </div>
    </div>
  );
}

// 字幕列表组件，显示所有字幕并高亮当前播放的字幕
interface SubtitleListProps {
  subtitles: SubtitleEntry[];
  currentTime: number;
  onSubtitleClick?: (timestamp: number) => void;
  className?: string;
}

export function SubtitleList({
  subtitles,
  currentTime,
  onSubtitleClick,
  className = '',
}: SubtitleListProps) {
  const getCurrentSubtitleIndex = () => {
    return subtitles.findIndex(
      (subtitle) =>
        currentTime >= subtitle.startTime / 1000 && currentTime <= subtitle.endTime / 1000
    );
  };

  const currentIndex = getCurrentSubtitleIndex();

  // 格式化时间显示
  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 ${className}`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span className="text-indigo-600">📝</span>
          字幕列表
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          点击字幕跳转到对应时间点
        </p>
      </div>

      {/* 字幕列表 */}
      <div className="flex-1 overflow-y-auto">
        {subtitles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-center">暂无字幕内容</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {subtitles.map((subtitle, index) => (
              <div
                key={index}
                onClick={() => onSubtitleClick?.(subtitle.startTime / 1000)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                  index === currentIndex
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-900 dark:text-indigo-100'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent hover:border-l-gray-300 dark:hover:border-l-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded ${
                      index === currentIndex
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {formatTime(subtitle.startTime)}
                  </span>
                  <p
                    className={`text-sm leading-relaxed flex-1 ${
                      index === currentIndex
                        ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {subtitle.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
