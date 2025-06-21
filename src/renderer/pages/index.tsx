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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Subtitles and Words List Column */}
          <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 border-b pb-2">单词列表</h2>
            <ul className="space-y-2">
              {words.map((word, index) => (
                <li
                  key={index}
                  onClick={() => handleWordClick(word.original)}
                  className={`cursor-pointer p-3 rounded-md transition-all duration-200 ease-in-out ${
                    selectedWord === word.original
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-600'
                  }`}
                >
                  <span className="font-semibold">{word.original}</span>
                  <span className="text-sm text-gray-500 ml-2">({word.count}次)</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Word Definition Column */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 border-b pb-2">单词释义</h2>
            {isLookingUp ? (
              <p className="text-center text-gray-500">正在查询...</p>
            ) : wordDefinition ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">
                    {wordDefinition.word}
                    {wordDefinition.wordHeadTranslation && (
                      <span className="text-xl text-green-800 font-semibold ml-4">
                        {wordDefinition.wordHeadTranslation}
                      </span>
                    )}
                  </h3>
                  {wordDefinition.phonetic && (
                    <p className="text-lg text-gray-500 mt-1">{wordDefinition.phonetic}</p>
                  )}
                </div>

                {wordDefinition.meanings.map((meaning, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-xl font-semibold text-blue-600 mb-1">
                      {meaning.partOfSpeech}
                    </h4>
                    <p className="text-md font-medium text-blue-500 mb-3">
                      {meaning.chinesePartOfSpeech}
                    </p>
                    <ul className="space-y-4">
                      {meaning.definitions.map((def, i) => (
                        <li key={i} className="pl-4 border-l-4 border-blue-200">
                          <p className="font-medium text-gray-800">{def.english}</p>
                          <p className="text-green-700">{def.chinese}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {wordDefinition.examples.length > 0 && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">例句</h4>
                    <ul className="space-y-4">
                      {wordDefinition.examples.map((example, i) => (
                        <li key={i} className="pl-4 border-l-4 border-gray-200">
                          <p className="font-medium text-gray-800">{example.english}</p>
                          <p className="text-green-700">{example.chinese}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500">从左侧选择一个单词以查看其定义。</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
