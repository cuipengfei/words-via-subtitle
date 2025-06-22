import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { KeyboardShortcutsHelp } from '../../../src/renderer/components/KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  it('renders keyboard shortcut button initially', () => {
    render(<KeyboardShortcutsHelp />);

    // 应该渲染一个带有快捷键图标的按钮
    expect(screen.getByTitle('键盘快捷键')).toBeInTheDocument();
  });

  it('opens shortcuts modal when button is clicked', () => {
    render(<KeyboardShortcutsHelp />);

    // 点击按钮
    fireEvent.click(screen.getByTitle('键盘快捷键'));

    // 应该显示标题和一些快捷键
    expect(screen.getByText('键盘快捷键')).toBeInTheDocument();
    expect(screen.getByText('提升您的使用效率')).toBeInTheDocument();

    // 检查分类标题
    expect(screen.getByText('文件操作')).toBeInTheDocument();
    expect(screen.getByText('视频控制')).toBeInTheDocument();
    expect(screen.getByText('导航')).toBeInTheDocument();

    // 检查一些具体的快捷键
    expect(screen.getByText('打开字幕文件')).toBeInTheDocument();
    expect(screen.getByText('Ctrl/Cmd + O')).toBeInTheDocument();
    expect(screen.getByText('播放/暂停视频')).toBeInTheDocument();
    expect(screen.getByText('空格')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    render(<KeyboardShortcutsHelp />);

    // 点击按钮打开模态框
    fireEvent.click(screen.getByTitle('键盘快捷键'));

    // 确认模态框已打开
    expect(screen.getByText('键盘快捷键')).toBeInTheDocument(); // 查找关闭按钮 - 它是模态框标题旁边的按钮，包含X图标
    const closeButtons = screen.getAllByRole('button');
    // 找到关闭按钮，它是除了键盘快捷键按钮以外的唯一按钮
    const closeButton = closeButtons.find((button) => !button.title);
    expect(closeButton).not.toBeUndefined();
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    // 确认模态框已关闭
    expect(screen.queryByText('提升您的使用效率')).not.toBeInTheDocument();
  });
});
