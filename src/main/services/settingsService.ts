// 设置服务
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { AppSettings } from '@/shared/ipc';

/**
 * 应用设置服务
 * 负责管理应用配置和用户偏好设置
 */
export class SettingsService {
  private configPath: string;
  private settings: AppSettings;

  /**
   * 默认设置
   */
  private readonly defaultSettings: AppSettings = {
    theme: 'system',
    defaultDictionary: 'local',
    autoPlaySubtitle: true,
    repeatTimes: 1,
    playbackSpeed: 1,
    subtitleFontSize: 16,
    enableAutoSave: true,
    dataPath: path.join(app.getPath('userData'), 'data'),
  };

  /**
   * 构造函数
   */
  constructor() {
    // 设置文件存储在用户数据目录
    this.configPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this.loadSettings();

    // 确保数据目录存在
    if (!fs.existsSync(this.settings.dataPath)) {
      try {
        fs.mkdirSync(this.settings.dataPath, { recursive: true });
      } catch (error) {
        console.error('Failed to create data directory:', error);
      }
    }
  }

  /**
   * 加载设置
   * @returns 应用设置
   */
  private loadSettings(): AppSettings {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        const loadedSettings = JSON.parse(data);
        // 合并默认设置和已保存设置
        return { ...this.defaultSettings, ...loadedSettings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return { ...this.defaultSettings };
  }

  /**
   * 保存设置到文件
   */
  private saveSettings(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * 获取当前设置
   * @returns 应用设置
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * 更新设置
   * @param newSettings 要更新的设置部分
   */
  updateSettings(newSettings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // 如果更新了数据路径，确保新目录存在
    if (newSettings.dataPath && newSettings.dataPath !== this.defaultSettings.dataPath) {
      try {
        fs.mkdirSync(newSettings.dataPath, { recursive: true });
      } catch (error) {
        console.error('Failed to create new data directory:', error);
      }
    }
  }

  /**
   * 重置所有设置为默认值
   */
  resetSettings(): void {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
  }

  /**
   * 获取数据文件路径
   * @param fileName 文件名
   * @returns 完整文件路径
   */
  getDataFilePath(fileName: string): string {
    return path.join(this.settings.dataPath, fileName);
  }
}
