import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutItem {
  key: string;
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  { key: 'Ctrl/Cmd + O', description: '打开字幕文件', category: '文件操作' },
  { key: 'Ctrl/Cmd + Shift + O', description: '打开视频文件', category: '文件操作' },
  { key: '空格', description: '播放/暂停视频', category: '视频控制' },
  { key: '←', description: '后退10秒', category: '视频控制' },
  { key: '→', description: '前进10秒', category: '视频控制' },
  { key: 'F11', description: '全屏切换', category: '视频控制' },
  { key: 'Esc', description: '退出全屏', category: '视频控制' },
  { key: 'Ctrl/Cmd + F', description: '聚焦搜索框', category: '导航' },
  { key: '↑', description: '上一个单词', category: '导航' },
  { key: '↓', description: '下一个单词', category: '导航' },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
        title="键盘快捷键"
      >
        <Keyboard size={18} />
      </button>

      {/* 快捷键帮助弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Keyboard size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    键盘快捷键
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    提升您的使用效率
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {categories.map((category) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts
                      .filter((shortcut) => shortcut.category === category)
                      .map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <span className="text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <kbd className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono text-gray-600 dark:text-gray-400 shadow-sm">
                            {shortcut.key}
                          </kbd>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 底部提示 */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                💡 提示：这些快捷键在应用的任何地方都可以使用（除了输入框内）
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
