import { BookOpenText, MessageCircleQuestion, Volume2, Heart, Check, X } from 'lucide-react';

import type { DictionaryEntry } from '@shared/types';

const DefinitionSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="space-y-2">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="space-y-3">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
  </div>
);

export function WordDefinition({
  definition,
  isLoading,
  selectedWord,
}: {
  definition: DictionaryEntry | null;
  isLoading: boolean;
  selectedWord: string | null;
}) {
  if (isLoading) {
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
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpenText size={20} className="text-indigo-600" />
            单词释义
          </h2>
        </div>
        <DefinitionSkeleton />
      </div>
    );
  }
  if (!selectedWord) {
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
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpenText size={20} className="text-indigo-600" />
            单词释义
          </h2>
        </div>
        <div
          style={{ height: 'calc(100% - 80px)', overflowY: 'auto', padding: '16px' }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <MessageCircleQuestion size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
              选择一个单词
            </h3>
            <p className="text-center text-sm max-w-sm leading-relaxed mb-6">
              从左侧列表中选择一个单词，或点击视频字幕中的单词，查看详细的释义和用法示例。
            </p>

            {/* 添加测试内容来验证滚动 */}
            <div className="w-full space-y-4 mb-6">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    测试内容 {i + 1}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    这是一些测试内容，用来验证滚动功能是否正常工作。每个块都包含足够的文本来测试垂直滚动。
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>英英释义</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>中文翻译</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>例句展示</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!definition) {
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
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
          }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpenText size={20} className="text-indigo-600" />
            单词释义
          </h2>
        </div>
        <div
          style={{ height: 'calc(100% - 80px)', overflowY: 'auto', padding: '16px' }}
          className="bg-gray-50 dark:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <MessageCircleQuestion size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              释义查询失败
            </h3>
            <p className="text-center text-sm leading-relaxed">
              抱歉，无法获取单词 "{selectedWord}" 的释义信息。请检查网络连接后重试。
            </p>
          </div>
        </div>
      </div>
    );
  }
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
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <BookOpenText size={20} className="text-indigo-600" />
          单词释义
        </h2>
      </div>

      {/* 释义内容区域 - 独立滚动 */}
      <div
        style={{ height: 'calc(100% - 80px)', overflowY: 'auto', padding: '16px' }}
        className="bg-white dark:bg-gray-900"
        data-testid="word-definition"
      >
        {/* 单词标题区 */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {definition.word}
                </h3>
                {definition.wordHeadTranslation && (
                  <span className="text-2xl font-medium text-indigo-600 dark:text-indigo-400">
                    {definition.wordHeadTranslation}
                  </span>
                )}
              </div>
              {definition.phonetic && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-600 dark:text-gray-400 font-mono">
                    {definition.phonetic}
                  </span>
                  <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Volume2 size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* 学习操作按钮 */}
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 transition-colors">
                <Check size={18} />
              </button>
              <button className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 transition-colors">
                <X size={18} />
              </button>
              <button className="p-2 rounded-lg bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/30 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-300 transition-colors">
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 词性定义块 */}
        {definition.meanings.map((meaning, index) => (
          <div
            key={index}
            className="mb-8 border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg"
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                  {meaning.partOfSpeech}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {meaning.chinesePartOfSpeech}
                </span>
              </div>

              <ul className="space-y-3">
                {meaning.definitions.map((def, i) => (
                  <li key={i} className="space-y-1">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                      <span className="inline-block w-6 text-gray-400 text-sm">{i + 1}.</span>
                      {def.english}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm ml-6 leading-relaxed">
                      {def.chinese}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        {/* 例句区域 */}
        {definition.examples && definition.examples.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <span className="text-indigo-600">📝</span>
              例句
            </h4>
            <div className="space-y-4">
              {definition.examples.map((example, i) => (
                <div
                  key={i}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-2">
                    • {example.english}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-relaxed ml-3">
                    {example.chinese}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
