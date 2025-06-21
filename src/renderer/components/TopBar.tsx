import { FileText, FolderOpen } from 'lucide-react';

export function TopBar({ 
  selectedFileName, 
  onOpenFile 
}: { 
  selectedFileName: string | null;
  onOpenFile?: () => void;
}) {
  return (
    <div className="h-[50px] flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
          <span className="text-white text-sm font-bold">字</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">字幕学单词</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {selectedFileName ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md">
            <FileText size={16} />
            <span className="max-w-[300px] truncate">当前文件: {selectedFileName}</span>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-500">
            未选择文件
          </div>
        )}
        
        {onOpenFile && (
          <button
            onClick={onOpenFile}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-2"
          >
            <FolderOpen size={16} />
            打开文件
          </button>
        )}
      </div>
    </div>
  );
}
