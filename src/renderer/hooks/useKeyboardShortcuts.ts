import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onOpenSubtitle?: () => void;
  onOpenVideo?: () => void;
  onTogglePlay?: () => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  onFocusSearch?: () => void;
  onNextWord?: () => void;
  onPrevWord?: () => void;
  onToggleFullscreen?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果用户正在输入框中输入，不处理快捷键
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const { ctrlKey, metaKey, shiftKey, altKey, key } = event;
      const isModifierPressed = ctrlKey || metaKey;

      // Ctrl/Cmd + O: 打开字幕文件
      if (isModifierPressed && key === 'o' && !shiftKey) {
        event.preventDefault();
        config.onOpenSubtitle?.();
        return;
      }

      // Ctrl/Cmd + Shift + O: 打开视频文件
      if (isModifierPressed && key === 'O' && shiftKey) {
        event.preventDefault();
        config.onOpenVideo?.();
        return;
      }

      // 空格键: 播放/暂停
      if (key === ' ' && !isModifierPressed) {
        event.preventDefault();
        config.onTogglePlay?.();
        return;
      }

      // 左箭头: 后退10秒
      if (key === 'ArrowLeft' && !isModifierPressed) {
        event.preventDefault();
        config.onSkipBackward?.();
        return;
      }

      // 右箭头: 前进10秒
      if (key === 'ArrowRight' && !isModifierPressed) {
        event.preventDefault();
        config.onSkipForward?.();
        return;
      }

      // Ctrl/Cmd + F: 聚焦搜索框
      if (isModifierPressed && key === 'f') {
        event.preventDefault();
        config.onFocusSearch?.();
        return;
      }

      // 上箭头: 上一个单词
      if (key === 'ArrowUp' && !isModifierPressed) {
        event.preventDefault();
        config.onPrevWord?.();
        return;
      }

      // 下箭头: 下一个单词
      if (key === 'ArrowDown' && !isModifierPressed) {
        event.preventDefault();
        config.onNextWord?.();
        return;
      }

      // F11: 全屏切换
      if (key === 'F11') {
        event.preventDefault();
        config.onToggleFullscreen?.();
        return;
      }

      // Escape: 退出全屏
      if (key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [config]);

  // 返回快捷键说明
  const shortcuts = [
    { key: 'Ctrl/Cmd + O', description: '打开字幕文件' },
    { key: 'Ctrl/Cmd + Shift + O', description: '打开视频文件' },
    { key: '空格', description: '播放/暂停' },
    { key: '←', description: '后退10秒' },
    { key: '→', description: '前进10秒' },
    { key: 'Ctrl/Cmd + F', description: '搜索单词' },
    { key: '↑', description: '上一个单词' },
    { key: '↓', description: '下一个单词' },
    { key: 'F11', description: '全屏切换' },
    { key: 'Esc', description: '退出全屏' },
  ];

  return { shortcuts };
}
