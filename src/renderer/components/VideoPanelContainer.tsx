import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { VideoPlayer, VideoPlayerRef } from './VideoPlayer';
import { SubtitleOverlay } from './SubtitleOverlay';
import type { SubtitleEntry } from '@shared/types';

interface VideoPanelContainerProps {
  videoSrc?: string;
  subtitles: SubtitleEntry[];
  onWordClick?: (word: string, timestamp: number) => void;
  className?: string;
}

export interface VideoPanelContainerRef {
  togglePlay: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  toggleFullscreen: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const VideoPanelContainer = forwardRef<VideoPanelContainerRef, VideoPanelContainerProps>(
  ({ videoSrc, subtitles, onWordClick, className = '' }, ref) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const videoPlayerRef = useRef<VideoPlayerRef>(null);

    // 处理视频时间更新
    const handleTimeUpdate = (time: number) => {
      setCurrentTime(time);
    };

    // 处理视频元数据加载完成
    const handleLoadedMetadata = (duration: number) => {
      setVideoDuration(duration);
    };

    // 转发视频播放器方法给父组件
    useImperativeHandle(ref, () => ({
      togglePlay: () => videoPlayerRef.current?.togglePlay(),
      skipBackward: () => videoPlayerRef.current?.skipBackward(),
      skipForward: () => videoPlayerRef.current?.skipForward(),
      toggleFullscreen: () => videoPlayerRef.current?.toggleFullscreen(),
      setPlaybackSpeed: (speed: number) => videoPlayerRef.current?.setPlaybackSpeed(speed),
    }));

    return (
      <div className={`relative ${className}`}>
        <VideoPlayer
          ref={videoPlayerRef}
          videoSrc={videoSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full"
        />
        <div className="absolute bottom-16 left-0 right-0 z-10 pointer-events-none">
          <SubtitleOverlay
            subtitles={subtitles}
            currentTime={currentTime}
            onWordClick={(word, timestamp) => {
              // 点击单词时是需要交互的，设置pointer-events-auto
              if (onWordClick) {
                onWordClick(word, timestamp);
              }
            }}
            className="text-center text-xl text-white text-shadow px-4 pointer-events-auto"
          />
        </div>
      </div>
    );
  }
);
