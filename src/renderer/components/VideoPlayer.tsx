import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
} from 'lucide-react';

interface VideoPlayerProps {
  videoSrc?: string;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  className?: string;
}

export interface VideoPlayerRef {
  togglePlay: () => void;
  skipBackward: () => void;
  skipForward: () => void;
  toggleFullscreen: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoSrc, currentTime = 0, onTimeUpdate, onLoadedMetadata, className = '' }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 添加播放速度状态
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 格式化时间显示
    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // 播放/暂停控制
    const togglePlay = () => {
      if (!videoRef.current) return;

      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    // 音量控制
    const toggleMute = () => {
      if (!videoRef.current) return;

      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
    };

    // 进度控制
    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    };

    // 跳转控制
    const skipBackward = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
      }
    };

    const skipForward = () => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
      }
    };

    // 全屏控制
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        videoRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    };

    // 控制栏显示/隐藏
    const showControlsTemporarily = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    // 视频事件处理
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        onTimeUpdate?.(video.currentTime);
      };

      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        onLoadedMetadata?.(video.duration);
      };

      const handleLoadStart = () => setIsLoading(true);
      const handleCanPlay = () => setIsLoading(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      };
    }, [onTimeUpdate, onLoadedMetadata]);

    // 外部时间控制
    useEffect(() => {
      if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
        videoRef.current.currentTime = currentTime;
      }
    }, [currentTime]);

    // 播放速度控制
    const handlePlaybackSpeedChange = (speed: number) => {
      setPlaybackSpeed(speed);
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      togglePlay,
      skipBackward,
      skipForward,
      toggleFullscreen,
      setPlaybackSpeed: handlePlaybackSpeedChange,
    }));

    if (!videoSrc) {
      return (
        <div
          className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg overflow-hidden ${className}`}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-300 p-8">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Play size={48} className="text-white ml-2" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">视频播放器</h3>
            <p className="text-center text-gray-400 max-w-md leading-relaxed mb-6">
              选择视频文件后，您可以在这里观看视频并与字幕同步学习。支持常见的视频格式。
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>MP4</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>AVI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>MKV</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>更多格式</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* 视频元素 */}
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />

        {/* 加载指示器 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* 控制栏 */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* 进度条 */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255, 255, 255, 0.3) ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, rgba(255, 255, 255, 0.3) 100%)`,
                }}
              />
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* 播放控制 */}
              <button
                onClick={skipBackward}
                className="p-2 text-white hover:text-indigo-400 transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                onClick={skipForward}
                className="p-2 text-white hover:text-indigo-400 transition-colors"
              >
                <SkipForward size={20} />
              </button>

              {/* 时间显示 */}
              <span className="text-white text-sm ml-4">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 音量控制 */}
              <button
                onClick={toggleMute}
                className="p-2 text-white hover:text-indigo-400 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              />

              {/* 播放速度控制 */}
              <div className="flex items-center">
                <select
                  value={playbackSpeed}
                  onChange={(e) => handlePlaybackSpeedChange(parseFloat(e.target.value))}
                  className="bg-black/50 text-white text-xs rounded px-2 py-1 outline-none border border-white/20"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
              </div>

              {/* 设置按钮 */}
              <button className="p-2 text-white hover:text-indigo-400 transition-colors">
                <Settings size={20} />
              </button>

              {/* 全屏按钮 */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-indigo-400 transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
