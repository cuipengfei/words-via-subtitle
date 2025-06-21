import { useState, useCallback } from 'react';
import Head from 'next/head';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TopBar } from '@/renderer/components/TopBar';
import { WordList } from '@/renderer/components/WordList';
import { WordDefinition } from '@/renderer/components/WordDefinition';
import { EmptyState, Button } from '@/renderer/components/UI';
import type { SubtitleEntry, Word, DictionaryEntry } from '@shared/types';
import { FolderOpen } from 'lucide-react';

export default function AppPage() {
  const [subtitleEntries, setSubtitleEntries] = useState<SubtitleEntry[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<DictionaryEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <TopBar selectedFileName={selectedFileName} onOpenFile={handleFileSelect} />
        <div className="flex-1 overflow-hidden">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={30} minSize={20} maxSize={40}>
              {words.length > 0 ? (
                <WordList
                  words={words}
                  selectedWord={selectedWord}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  onSelectWord={handleWordSelect}
                />
              ) : (
                <EmptyState
                  icon={<FolderOpen size={64} />}
                  title="选择字幕文件开始学习"
                  subtitle="支持 SRT 和 ASS 格式的字幕文件。系统将自动提取单词并统计词频，帮助您高效学习。"
                  action={
                    <Button onClick={handleFileSelect} size="lg">
                      <FolderOpen size={18} />
                      选择SRT/ASS文件
                    </Button>
                  }
                  className="bg-white dark:bg-gray-900"
                />
              )}
            </Panel>
            <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200 cursor-col-resize group relative">
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-400 transition-colors duration-200 rounded-full"></div>
            </PanelResizeHandle>
            <Panel>
              <WordDefinition
                definition={wordDefinition}
                isLoading={isLookingUp}
                selectedWord={selectedWord}
              />
            </Panel>
          </PanelGroup>
        </div>{' '}
        {error && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md z-50 animate-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">操作失败</div>
                <div className="text-sm leading-relaxed">{error}</div>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
