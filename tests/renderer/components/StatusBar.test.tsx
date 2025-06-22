import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { StatusBar } from '../../../src/renderer/components/StatusBar';

describe('StatusBar', () => {
  it('renders with basic props', () => {
    render(
      <StatusBar totalWords={100} selectedWord={null} currentTime={120} videoDuration={600} />
    );

    expect(screen.getByText('单词: 100')).toBeInTheDocument();
    expect(screen.getByText('进度: 20.0%')).toBeInTheDocument();
    expect(screen.getByText('02:00 / 10:00')).toBeInTheDocument();
    expect(screen.getByText('● 在线')).toBeInTheDocument();
  });

  it('renders with selected word', () => {
    render(
      <StatusBar totalWords={100} selectedWord="example" currentTime={120} videoDuration={600} />
    );

    expect(screen.getByText('当前: example')).toBeInTheDocument();
  });

  it('handles zero video duration properly', () => {
    render(<StatusBar totalWords={100} selectedWord={null} currentTime={0} videoDuration={0} />);

    expect(screen.getByText('进度: 0.0%')).toBeInTheDocument();
    // 时间元素不应该渲染
    expect(screen.queryByText(/\d{2}:\d{2} \/ \d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it('applies custom className if provided', () => {
    const { container } = render(
      <StatusBar
        totalWords={100}
        selectedWord={null}
        currentTime={0}
        videoDuration={0}
        className="test-custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('test-custom-class');
  });
});
