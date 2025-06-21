import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);

  useEffect(() => {
    // 监听字幕文件打开事件
    const unsubscribeSubtitle = window.electronAPI.openSubtitleFile((filePath) => {
      console.log('打开字幕文件:', filePath);
      // 这里将添加字幕解析和处理逻辑
      setSubtitle(filePath);
    });

    // 监听视频文件打开事件
    const unsubscribeVideo = window.electronAPI.openVideoFile((filePath) => {
      console.log('打开视频文件:', filePath);
      setVideoPath(filePath);
    });

    // 组件卸载时清理监听器
    return () => {
      unsubscribeSubtitle();
      unsubscribeVideo();
    };
  }, []);

  return (
    <>
      <Head>
        <title>字幕学单词</title>
        <meta name="description" content="通过字幕学习英语单词" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-between p-6">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
          <h1 className="text-3xl font-bold mb-4 text-center">字幕学单词</h1>

          {!subtitle && !videoPath && (
            <div className="text-center p-8">
              <p className="mb-4">欢迎使用字幕学单词！</p>
              <p>使用菜单栏中的"文件 &gt; 打开字幕文件"开始学习</p>
            </div>
          )}

          {subtitle && (
            <div className="mb-4 p-4 border rounded">
              <h2 className="text-xl font-bold mb-2">已加载字幕文件</h2>
              <p className="break-all">{subtitle}</p>
            </div>
          )}

          {videoPath && (
            <div className="p-4 border rounded">
              <h2 className="text-xl font-bold mb-2">已加载视频文件</h2>
              <p className="break-all">{videoPath}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
