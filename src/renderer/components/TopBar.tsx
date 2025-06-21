import { FileText } from 'lucide-react';

export function TopBar({ selectedFileName }: { selectedFileName: string | null }) {
  return (
    <div className="h-[50px] flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold">字幕学单词</h1>
      </div>
      {selectedFileName && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FileText size={16} />
          <span>{selectedFileName}</span>
        </div>
      )}
      <div className="w-[200px]"></div>
    </div>
  );
}
