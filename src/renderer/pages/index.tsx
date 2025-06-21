import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [subtitleData, setSubtitleData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查是否在 Electron 环境中
    if (typeof window !== 'undefined' && window.electron) {
      console.log('Electron API 可用');

      // 监听来自主进程的文件打开事件
      const { ipcRenderer } = window.require('electron');

      // 监听字幕文件打开
      ipcRenderer.on('file-opened', async (event: any, filePath: string) => {
        console.log('收到字幕文件路径:', filePath);
        setSubtitle(filePath);
        setLoading(true);

        try {
          // 调用字幕解析 API
          const result = await window.electron.parseSubtitleFile(filePath);
          setSubtitleData(result);
          console.log('字幕解析结果:', result);
        } catch (error) {
          console.error('字幕解析失败:', error);
        } finally {
          setLoading(false);
        }
      });

      // 监听视频文件打开
      ipcRenderer.on('video-opened', (event: any, filePath: string) => {
        console.log('收到视频文件路径:', filePath);
        setVideoPath(filePath);
      });

      // 清理函数
      return () => {
        ipcRenderer.removeAllListeners('file-opened');
        ipcRenderer.removeAllListeners('video-opened');
      };
    } else {
      console.log('非 Electron 环境，使用模拟数据');
    }
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

          {loading && (
            <div className="text-center p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2">正在解析字幕文件...</p>
            </div>
          )}

          {subtitle && !loading && (
            <div className="mb-4 p-4 border rounded">
              <h2 className="text-xl font-bold mb-2">已加载字幕文件</h2>
              <p className="break-all text-sm text-gray-600 mb-2">{subtitle}</p>
              {subtitleData && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    解析结果：{subtitleData.subtitles?.length || 0} 条字幕，
                    {subtitleData.words?.length || 0} 个单词
                  </p>
                  {subtitleData.subtitles?.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <h3 className="font-semibold mb-1">字幕预览：</h3>
                      {subtitleData.subtitles.slice(0, 3).map((sub: any, index: number) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 mb-1 rounded">
                          <span className="text-blue-600">
                            [{Math.floor(sub.startTime / 1000)}s]
                          </span>{' '}
                          {sub.text}
                        </div>
                      ))}
                      {subtitleData.subtitles.length > 3 && (
                        <p className="text-xs text-gray-400">
                          ...还有 {subtitleData.subtitles.length - 3} 条字幕
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {videoPath && (
            <div className="p-4 border rounded">
              <h2 className="text-xl font-bold mb-2">已加载视频文件</h2>
              <p className="break-all text-sm text-gray-600">{videoPath}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
