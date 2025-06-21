import { useState, useCallback } from 'react';
import Head from 'next/head';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { TopBar } from '@/renderer/components/TopBar';
import { WordList } from '@/renderer/components/WordList';
import { WordDefinition } from '@/renderer/components/WordDefinition';
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
        <TopBar selectedFileName={selectedFileName} />
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
                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 p-8">
                  <FolderOpen size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                  <h3 className="text-lg font-semibold mb-2">打开文件</h3>
                  <p className="text-center text-sm max-w-sm mb-4">
                    通过点击下面的按钮来选择一个字幕文件开始学习
                  </p>
                  <button
                    onClick={handleFileSelect}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <FolderOpen size={16} />
                    选择字幕文件
                  </button>
                </div>
              )}
            </Panel>
            <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-800 hover:bg-indigo-500 transition-colors duration-200" />
            <Panel>
              <WordDefinition
                definition={wordDefinition}
                isLoading={isLookingUp}
                selectedWord={selectedWord}
              />
            </Panel>
          </PanelGroup>
        </div>
        {error && (
          <div
            className="absolute top-14 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg"
            role="alert"
          >
            <strong className="font-bold">错误!</strong>
            <span className="block sm:inline"> {error}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </>
  );
}
