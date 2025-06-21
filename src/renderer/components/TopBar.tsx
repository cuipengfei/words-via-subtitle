import { FileText, FolderOpen, Play, Settings } from 'lucide-react';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

export function TopBar({
  selectedFileName,
  videoFileName,
  onOpenFile,
  onOpenVideo,
}: {
  selectedFileName: string | null;
  videoFileName?: string | null;
  onOpenFile?: () => void;
  onOpenVideo?: () => void;
}) {
  return (
    <div className="h-[60px] flex-shrink-0 bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 dark:from-gray-900/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 relative z-10 shadow-sm">
      {/* 左侧：应用标识 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover-lift">
          <span className="text-white text-lg font-bold">字</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">字幕学单词</h1>
        <div className="hidden sm:block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
          v2.0
        </div>
      </div>

      {/* 中间：文件状态指示器 */}
      <div className="flex items-center gap-4">
        {selectedFileName && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <FileText size={16} />
            <span className="max-w-[200px] truncate">字幕: {selectedFileName}</span>
          </div>
        )}

        {videoFileName && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <Play size={16} />
            <span className="max-w-[200px] truncate">视频: {videoFileName}</span>
          </div>
        )}

        {!selectedFileName && !videoFileName && (
          <div className="text-sm text-gray-500 dark:text-gray-500">请选择字幕和视频文件</div>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-3">
        {onOpenFile && (
          <button
            onClick={onOpenFile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 hover-lift shadow-md"
          >
            <FolderOpen size={16} />
            选择字幕
          </button>
        )}

        {onOpenVideo && (
          <button
            onClick={onOpenVideo}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 hover-lift shadow-md"
          >
            <Play size={16} />
            选择视频
          </button>
        )}

        <KeyboardShortcutsHelp />

        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
