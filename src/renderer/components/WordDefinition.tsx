import { BookOpenText, MessageCircleQuestion, Volume2 } from 'lucide-react';
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

const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  className = "",
}: {
  icon: any;
  title: string;
  subtitle: string;
  className?: string;
}) => (
  <div className={`flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8 ${className}`}>
    <Icon size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
    <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
    <p className="text-center text-sm max-w-sm leading-relaxed">{subtitle}</p>
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
      <div className="h-full bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
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
      <div className="h-full bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpenText size={20} className="text-indigo-600" />
            单词释义
          </h2>
        </div>
        <EmptyState
          icon={MessageCircleQuestion}
          title="选择一个单词"
          subtitle="从左侧列表中选择一个单词以查看其定义和用法示例。"
        />
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="h-full bg-white dark:bg-gray-900">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <BookOpenText size={20} className="text-indigo-600" />
            单词释义
          </h2>
        </div>
        <EmptyState
          icon={MessageCircleQuestion}
          title="释义查询失败"
          subtitle={`抱歉，无法获取单词 "${selectedWord}" 的释义信息。请检查网络连接后重试。`}
          className="text-orange-500 dark:text-orange-400"
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* 面板头部 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <BookOpenText size={20} className="text-indigo-600" />
          单词释义
        </h2>
      </div>
      
      {/* 释义内容区域 - 独立滚动 */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* 单词标题区 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{definition.word}</h3>
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

        {/* 词性定义块 */}
        {definition.meanings.map((meaning, index) => (
          <div key={index} className="mb-8 border-l-4 border-indigo-500 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
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
                <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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
