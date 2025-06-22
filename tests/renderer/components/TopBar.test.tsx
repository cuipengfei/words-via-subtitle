import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TopBar } from '../../../src/renderer/components/TopBar';

describe('TopBar', () => {
  it('renders the top bar with no files selected', () => {
    render(<TopBar selectedFileName={null} />);
    expect(screen.getByText('请选择字幕和视频文件')).toBeInTheDocument();
  });

  it('renders with subtitle file name', () => {
    render(<TopBar selectedFileName="test-subtitle.srt" />);
    expect(screen.getByText('字幕: test-subtitle.srt')).toBeInTheDocument();
  });

  it('renders with video file name', () => {
    render(<TopBar selectedFileName={null} videoFileName="test-video.mp4" />);
    expect(screen.getByText('视频: test-video.mp4')).toBeInTheDocument();
  });

  it('renders action buttons when handlers provided', () => {
    const onOpenFile = vi.fn();
    const onOpenVideo = vi.fn();

    render(<TopBar selectedFileName={null} onOpenFile={onOpenFile} onOpenVideo={onOpenVideo} />);

    const subtitleButton = screen.getByText('选择字幕');
    const videoButton = screen.getByText('选择视频');

    expect(subtitleButton).toBeInTheDocument();
    expect(videoButton).toBeInTheDocument();

    subtitleButton.click();
    videoButton.click();

    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onOpenVideo).toHaveBeenCalledTimes(1);
  });
});
