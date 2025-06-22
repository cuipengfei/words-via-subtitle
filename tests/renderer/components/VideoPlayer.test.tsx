import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { VideoPlayer, VideoPlayerRef } from '@renderer/components/VideoPlayer';
import '@testing-library/jest-dom';

const setupVideoMock = (video: HTMLVideoElement) => {
  let currentTime = 0;
  let isPaused = true;
  let isMuted = false;
  let volume = 1;
  const duration = 100;

  Object.defineProperties(video, {
    currentTime: {
      get: () => currentTime,
      set: (time: number) => {
        currentTime = Math.max(0, Math.min(time, duration));
        // Manually fire timeupdate in tests that need it.
      },
      configurable: true,
    },
    duration: {
      get: () => duration,
      configurable: true,
    },
    paused: {
      get: () => isPaused,
      configurable: true,
    },
    muted: {
      get: () => isMuted,
      set: (muted: boolean) => {
        isMuted = muted;
      },
      configurable: true,
    },
    volume: {
      get: () => volume,
      set: (vol: number) => {
        volume = vol;
      },
      configurable: true,
    },
    play: {
      value: vi.fn().mockImplementation(() => {
        isPaused = false;
        video.dispatchEvent(new Event('play'));
        return Promise.resolve();
      }),
      configurable: true,
    },
    pause: {
      value: vi.fn().mockImplementation(() => {
        isPaused = true;
        video.dispatchEvent(new Event('pause'));
      }),
      configurable: true,
    },
  });
};

describe('VideoPlayer', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the video element on mount when src is provided', () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    expect(screen.getByTestId('video-player')).toBeInTheDocument();
  });

  it('renders the video element with the correct src', () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);
    expect(video).toBeInTheDocument();
    // JSDOM resolves file paths relative to localhost
    expect(video.src).toBe('http://localhost:3000/test.mp4');
  });

  it('toggles play/pause when the play button is clicked', async () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);
    const playButton = screen.getByLabelText('Play/Pause');

    // Initial state should be paused
    expect(video.paused).toBe(true);

    // Click to play
    await act(async () => {
      fireEvent.click(playButton);
    });
    expect(video.play).toHaveBeenCalledTimes(1);
    expect(video.paused).toBe(false);

    // Click to pause
    await act(async () => {
      fireEvent.click(playButton);
    });
    expect(video.pause).toHaveBeenCalledTimes(1);
    expect(video.paused).toBe(true);
  });

  it('toggles mute when the volume button is clicked', () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);
    const volumeButton = screen.getByLabelText('Mute/Unmute');

    expect(video.muted).toBe(false);

    // Click to mute
    fireEvent.click(volumeButton);
    expect(video.muted).toBe(true);

    // Click to unmute
    fireEvent.click(volumeButton);
    expect(video.muted).toBe(false);
  });

  it('changes volume when the volume slider is adjusted', () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);
    const volumeSlider = screen.getByLabelText('Volume');

    fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    expect(video.volume).toBe(0.5);
  });

  it('seeks video when the progress bar is changed', () => {
    render(<VideoPlayer videoSrc="test.mp4" />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);
    const progressBar = screen.getByLabelText('Progress');

    fireEvent.change(progressBar, { target: { value: '30' } });
    expect(video.currentTime).toBe(30);
  });

  it('calls onTimeUpdate when video time updates', () => {
    const onTimeUpdate = vi.fn();
    render(<VideoPlayer videoSrc="test.mp4" onTimeUpdate={onTimeUpdate} />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);

    // Simulate time update by changing currentTime and firing the event
    video.currentTime = 15;
    fireEvent.timeUpdate(video);
    expect(onTimeUpdate).toHaveBeenCalledWith(15);
  });

  it('calls onLoadedMetadata when metadata is loaded', () => {
    const onLoadedMetadata = vi.fn();
    render(<VideoPlayer videoSrc="test.mp4" onLoadedMetadata={onLoadedMetadata} />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);

    // Simulate metadata load
    fireEvent.loadedMetadata(video);
    expect(onLoadedMetadata).toHaveBeenCalledWith(100); // duration is 100 in mock
  });

  it('skips forward and backward using imperative handle', () => {
    const ref = React.createRef<VideoPlayerRef>();
    render(<VideoPlayer videoSrc="test.mp4" ref={ref} />);
    const video = screen.getByTestId('video-player') as HTMLVideoElement;
    setupVideoMock(video);

    video.currentTime = 20;

    ref.current?.skipForward();
    expect(video.currentTime).toBe(30); // Skips 10 seconds

    ref.current?.skipBackward();
    expect(video.currentTime).toBe(20); // Skips back 10 seconds
  });
});
