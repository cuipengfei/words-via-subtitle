import { ElectronAPI } from '../../shared/ipc';

declare global {
  interface Window {
    electron: ElectronAPI;
    appInfo: {
      version: string;
    };
  }
}

export {};
