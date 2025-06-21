interface ElectronAPI {
  openSubtitleFile: (callback: (filePath: string) => void) => () => void;
  openVideoFile: (callback: (filePath: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
