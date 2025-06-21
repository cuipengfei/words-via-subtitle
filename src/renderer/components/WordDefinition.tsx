import { BookOpenText, MessageCircleQuestion } from 'lucide-react';
import type { DictionaryEntry } from '@shared/types';

const DefinitionSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3"></div>
    <div className="space-y-4 pt-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
    <div className="space-y-4 pt-4">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4"></div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
    </div>
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any;
  title: string;
  subtitle: string;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8">
    <Icon size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-center text-sm max-w-sm">{subtitle}</p>
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
    return <DefinitionSkeleton />;
  }

  if (!selectedWord) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="选择一个单词"
        subtitle="从左侧列表中选择一个单词以查看其定义和用法。"
      />
    );
  }

  if (!definition) {
    return (
      <EmptyState
        icon={MessageCircleQuestion}
        title="未找到释义"
        subtitle={`抱歉，我们找不到单词 "${selectedWord}" 的释义。`}
      />
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-3 dark:border-gray-700">
        <BookOpenText size={20} />
        单词释义
      </h2>
      <div>
        <h3 className="text-4xl font-bold">{definition.word}</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{definition.phonetic}</p>
      </div>

      {definition.meanings.map((def, index) => (
        <div key={index} className="mt-6 border-l-4 border-indigo-500 pl-4 py-2">
          <p className="font-bold text-lg">
            {def.partOfSpeech}{' '}
            <span className="text-gray-500 dark:text-gray-400">({def.chinesePartOfSpeech})</span>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2">
            {def.definitions.map((d, i) => (
              <li key={i}>
                <p>{d.english}</p>
                <p className="text-gray-500 dark:text-gray-400">{d.chinese}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {definition.examples && definition.examples.length > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-bold mb-3">用法示例</h4>
          <ul className="space-y-3">
            {definition.examples.map((ex, i) => (
              <li key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <p>{ex.english}</p>
                <p className="text-gray-500 dark:text-gray-400">{ex.chinese}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
