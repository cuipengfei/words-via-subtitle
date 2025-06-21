import { Clock, BookOpen, Target, TrendingUp } from 'lucide-react';

interface StatusBarProps {
  totalWords: number;
  selectedWord: string | null;
  currentTime: number;
  videoDuration: number;
  className?: string;
}

export function StatusBar({
  totalWords,
  selectedWord,
  currentTime,
  videoDuration,
  className = '',
}: StatusBarProps) {
  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比
  const progress = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  return (
    <div
      className={`h-8 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 text-xs text-gray-600 dark:text-gray-400 ${className}`}
    >
      {/* 左侧：学习统计 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <BookOpen size={14} />
          <span>单词: {totalWords}</span>
        </div>
        
        {selectedWord && (
          <div className="flex items-center gap-1">
            <Target size={14} />
            <span>当前: {selectedWord}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <TrendingUp size={14} />
          <span>进度: {progress.toFixed(1)}%</span>
        </div>
      </div>

      {/* 右侧：时间信息 */}
      <div className="flex items-center gap-4">
        {videoDuration > 0 && (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </span>
          </div>
        )}
        
        <div className="text-green-600 dark:text-green-400">
          ● 在线
        </div>
      </div>
    </div>
  );
}
