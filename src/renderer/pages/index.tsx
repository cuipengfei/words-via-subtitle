import { useState } from 'react';
import Head from 'next/head';
import type { SubtitleEntry, Word, DictionaryEntry } from '@shared/types';

export default function Home() {
  const [subtitleEntries, setSubtitleEntries] = useState<SubtitleEntry[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordDefinition, setWordDefinition] = useState<DictionaryEntry | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleFileSelect = async () => {
    setError(null);
    setSubtitleEntries([]);
    setWords([]);
    setSelectedFileName(null);

    try {
      // 1. 调用主进程API打开文件选择对话框
      const filePath = await window.electronAPI.openSubtitleFile();

      if (filePath) {
        // 从完整路径中提取文件名用于显示
        const fileName = filePath.split('\\').pop()?.split('/').pop() || filePath;
        setSelectedFileName(fileName);

        // 2. 调用主进程API解析文件
        const result = await window.electronAPI.parseSubtitleFile(filePath);

        // 3. 处理解析结果
        console.log('收到解析结果:', result);
        if (result.success && result.data) {
          console.log('设置字幕条目:', result.data.entries.length);
          console.log('设置单词列表:', result.data.words.length);
          setSubtitleEntries(result.data.entries);
          setWords(result.data.words);
        } else {
          console.error('解析失败:', result.error);
          setError(result.error || '未知解析错误');
        }
      }
    } catch (err) {
      console.error('Error selecting or parsing file:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleWordClick = async (word: string) => {
    setSelectedWord(word);
    setIsLookingUp(true);
    setWordDefinition(null);

    try {
      const definition = await window.electronAPI.lookupWord(word);
      setWordDefinition(definition);
    } catch (err) {
      console.error('查询单词失败:', err);
      setError(`查询单词 "${word}" 失败`);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <>
      <Head>
        <title>字幕学单词</title>
        <meta name="description" content="通过字幕学习英语单词" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto p-4 font-sans bg-gray-50 min-h-screen">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">字幕学单词</h1>
          <p className="text-lg text-gray-600">通过您最喜爱的电影和电视节目学习新单词</p>
        </header>

        <div className="text-center mb-8">
          <button
            onClick={handleFileSelect}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            选择字幕文件 (.srt, .ass)
          </button>
        </div>

        {selectedFileName && (
          <p className="text-center text-gray-600 mb-4">已选择文件: {selectedFileName}</p>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
            role="alert"
          >
            <strong className="font-bold">错误:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">字幕内容</h2>
            <div className="h-96 overflow-y-auto pr-2">
              {subtitleEntries.length > 0 ? (
                <ul className="space-y-2">
                  {subtitleEntries.map((entry) => (
                    <li key={entry.id} className="p-3 bg-gray-100 rounded-md text-gray-800">
                      <span className="font-mono text-sm text-gray-500 mr-4">
                        {entry.startTime} --&gt; {entry.endTime}
                      </span>
                      <p className="inline">{entry.text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">请先选择一个字幕文件来查看内容。</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">单词列表</h2>
            <div className="h-96 overflow-y-auto pr-2">
              {words.length > 0 ? (
                <ul className="space-y-2">
                  {words.map((word) => (
                    <li
                      key={word.original}
                      className="p-3 bg-gray-100 rounded-md flex justify-between items-center hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleWordClick(word.original)}
                    >
                      <span className="font-semibold text-gray-800">{word.original}</span>
                      <span className="text-sm text-gray-500">({word.count}次)</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">这里将显示从字幕中提取的单词。</p>
              )}
            </div>
          </div>
        </div>

        {/* 单词释义显示区域 */}
        {(selectedWord || wordDefinition || isLookingUp) && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">单词释义</h2>
            {isLookingUp ? (
              <div className="text-center p-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">正在查询单词 "{selectedWord}"...</p>
              </div>
            ) : wordDefinition ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {wordDefinition.word}
                  {wordDefinition.phonetic && (
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      [{wordDefinition.phonetic}]
                    </span>
                  )}
                </h3>
                {wordDefinition.partOfSpeech && (
                  <p className="text-sm text-blue-600 font-medium">{wordDefinition.partOfSpeech}</p>
                )}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">释义:</h4>
                  <p className="text-gray-800">{wordDefinition.definition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">翻译:</h4>
                  <p className="text-gray-800">{wordDefinition.translation}</p>
                </div>
                {wordDefinition.examples && wordDefinition.examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">例句:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {wordDefinition.examples.map((example, index) => (
                        <li key={index} className="text-gray-700">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : selectedWord ? (
              <div className="text-center p-4 text-gray-500">
                未找到单词 "{selectedWord}" 的释义
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
