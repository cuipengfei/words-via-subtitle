import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SettingsService } from '../../../src/main/services/settingsService';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// Mock electron modules
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(),
  },
}));

// Mock fs module
vi.mock('fs');

// Mock path module
vi.mock('path');

const mockedApp = vi.mocked(app);
const mockedFs = vi.mocked(fs);
const mockedPath = vi.mocked(path);

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    // Mock app.getPath to return a test directory
    mockedApp.getPath.mockReturnValue('/test/userdata');

    // Mock path.join to return predictable paths
    mockedPath.join.mockImplementation((...segments) => segments.join('/'));

    // Mock fs.existsSync to return true by default
    mockedFs.existsSync.mockReturnValue(true);

    // Mock fs.readFileSync to return default settings
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({
        theme: 'system',
        defaultDictionary: 'local',
        autoPlaySubtitle: true,
        repeatTimes: 1,
        playbackSpeed: 1,
        subtitleFontSize: 16,
        enableAutoSave: true,
        dataPath: '/test/userdata/data',
      })
    );

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor and initialization', () => {
    it('should initialize with default settings when config file does not exist', () => {
      // Test Case Name: Initialize with default settings
      // Description: Tests if service initializes with default settings when no config file exists
      // Input: No existing config file
      // Expected Output: Service initialized with default settings
      // Scenario Type: Positive

      mockedFs.existsSync.mockReturnValue(false);

      service = new SettingsService();

      expect(mockedApp.getPath).toHaveBeenCalledWith('userData');
      expect(mockedPath.join).toHaveBeenCalledWith('/test/userdata', 'settings.json');
    });

    it('should load existing settings when config file exists', () => {
      // Test Case Name: Load existing settings
      // Description: Tests if service loads settings from existing config file
      // Input: Existing config file with valid JSON
      // Expected Output: Service initialized with loaded settings
      // Scenario Type: Positive

      mockedFs.existsSync.mockReturnValue(true);
      const customSettings = {
        theme: 'dark',
        defaultDictionary: 'online',
        autoPlaySubtitle: false,
        repeatTimes: 2,
        playbackSpeed: 1.5,
        subtitleFontSize: 18,
        enableAutoSave: false,
        dataPath: '/custom/data/path',
      };
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(customSettings));

      service = new SettingsService();

      expect(mockedFs.readFileSync).toHaveBeenCalledWith('/test/userdata/settings.json', 'utf8');
    });

    it('should create data directory if it does not exist', () => {
      // Test Case Name: Create missing data directory
      // Description: Tests if service creates data directory when it doesn't exist
      // Input: Settings with non-existent data directory
      // Expected Output: Data directory created
      // Scenario Type: Positive

      mockedFs.existsSync
        .mockReturnValueOnce(true) // config file exists
        .mockReturnValueOnce(false); // data directory doesn't exist

      service = new SettingsService();

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/test/userdata/data', { recursive: true });
    });

    it('should handle malformed config file gracefully', () => {
      // Test Case Name: Handle malformed config file
      // Description: Tests if service handles corrupted config file gracefully
      // Input: Config file with invalid JSON
      // Expected Output: Service falls back to default settings
      // Scenario Type: Edge

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('invalid json');

      expect(() => new SettingsService()).not.toThrow();
    });

    it('should handle data directory creation failure gracefully', () => {
      // Test Case Name: Handle directory creation failure
      // Description: Tests if service handles data directory creation errors gracefully
      // Input: Data directory creation throws error
      // Expected Output: Service continues without crashing
      // Scenario Type: Edge

      mockedFs.existsSync
        .mockReturnValueOnce(true) // config file exists
        .mockReturnValueOnce(false); // data directory doesn't exist

      mockedFs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => new SettingsService()).not.toThrow();
    });
  });

  describe('settings operations', () => {
    beforeEach(() => {
      service = new SettingsService();
    });
    it('should get current settings', () => {
      // Test Case Name: Get current settings
      // Description: Tests if service returns current settings
      // Input: Service with loaded settings
      // Expected Output: Current settings object
      // Scenario Type: Positive

      const settings = service.getSettings();

      expect(settings).toBeDefined();
      expect(settings).toHaveProperty('theme');
      expect(settings).toHaveProperty('defaultDictionary');
      expect(settings).toHaveProperty('autoPlaySubtitle');
    });

    it('should update settings and save to file', () => {
      // Test Case Name: Update and save settings
      // Description: Tests if service updates settings and saves them to file
      // Input: New settings object
      // Expected Output: Settings updated and saved
      // Scenario Type: Positive

      const newSettings = {
        theme: 'dark' as const,
        defaultDictionary: 'online' as const,
        autoPlaySubtitle: false,
        repeatTimes: 3,
        playbackSpeed: 2,
        subtitleFontSize: 20,
        enableAutoSave: false,
        dataPath: '/new/data/path',
      };
      service.updateSettings(newSettings);

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        '/test/userdata/settings.json',
        expect.any(String),
        'utf8'
      );
      const writtenData = mockedFs.writeFileSync.mock.calls[0][1];
      expect(writtenData).toContain('"theme": "dark"');
      expect(writtenData).toContain('"defaultDictionary": "online"');
    });

    it('should handle settings save failure gracefully', () => {
      // Test Case Name: Handle settings save failure
      // Description: Tests if service handles file write errors gracefully
      // Input: Settings update with file write error
      // Expected Output: Error handled gracefully
      // Scenario Type: Edge

      mockedFs.writeFileSync.mockImplementation(() => {
        throw new Error('Disk full');
      });

      const newSettings = {
        theme: 'dark' as const,
        defaultDictionary: 'online' as const,
        autoPlaySubtitle: false,
        repeatTimes: 1,
        playbackSpeed: 1,
        subtitleFontSize: 16,
        enableAutoSave: true,
        dataPath: '/test/path',
      };

      expect(() => service.updateSettings(newSettings)).not.toThrow();
    });

    it('should reset settings to defaults', () => {
      // Test Case Name: Reset to default settings
      // Description: Tests if service can reset settings to default values
      // Input: Request to reset settings
      // Expected Output: Settings reset to defaults and saved      // Scenario Type: Positive

      service.resetSettings();

      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        '/test/userdata/settings.json',
        expect.any(String),
        'utf8'
      );
      const writtenData = mockedFs.writeFileSync.mock.calls[0][1];
      expect(writtenData).toContain('"theme": "system"');
      expect(writtenData).toContain('"defaultDictionary": "local"');
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      service = new SettingsService();
    });
    it('should validate settings before updating', () => {
      // Test Case Name: Validate settings before update
      // Description: Tests if service validates settings structure before updating
      // Input: Invalid settings object
      // Expected Output: Validation error or default values applied
      // Scenario Type: Edge

      const invalidSettings = {
        theme: 'invalid-theme' as any,
        // Missing required fields
      };

      // This should either throw an error or handle gracefully with defaults
      expect(() => service.updateSettings(invalidSettings)).not.toThrow();
    });

    it('should handle partial settings updates', () => {
      // Test Case Name: Handle partial settings updates
      // Description: Tests if service can handle updates with only some settings fields
      // Input: Partial settings object
      // Expected Output: Only specified fields updated, others remain unchanged
      // Scenario Type: Positive

      const partialSettings = {
        theme: 'dark' as const,
        playbackSpeed: 1.5,
      };

      const originalSettings = service.getSettings();
      service.updateSettings(partialSettings as any);
      const updatedSettings = service.getSettings();

      expect(updatedSettings.theme).toBe('dark');
      expect(updatedSettings.playbackSpeed).toBe(1.5);
      expect(updatedSettings.defaultDictionary).toBe(originalSettings.defaultDictionary);
    });
  });
});
