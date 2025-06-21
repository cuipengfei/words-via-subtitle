import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);

  useEffect(() => {
    // 暂时移除事件监听，稍后实现
    console.log('页面已加载，等待实现文件打开功能');
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
              <p>使用菜单栏中的&quot;文件 &gt; 打开字幕文件&quot;开始学习</p>
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
