import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ipcMain, dialog } from 'electron';
import { registerIpcHandlers } from '../../src/main/ipc-handlers';
import { SubtitleParserService } from '../../src/main/services/subtitleParser';
import { DictionaryService } from '../../src/main/services/dictionaryService';
import { IpcChannels } from '../../src/shared/ipc';
import * as fs from 'fs';

// Mock electron modules
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
  },
}));

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
  },
  constants: {
    F_OK: 0,
  },
}));

// Mock services
vi.mock('../../../src/main/services/subtitleParser');
vi.mock('../../../src/main/services/dictionaryService');

const mockedIpcMain = vi.mocked(ipcMain);
const mockedDialog = vi.mocked(dialog);
const mockedFs = vi.mocked(fs);

describe('IPC Handlers', () => {
  let mockSubtitleParser: SubtitleParserService;
  let mockDictionaryService: DictionaryService;
  let registeredHandlers: Map<string, Function>;

  beforeEach(() => {
    mockSubtitleParser = new SubtitleParserService();
    mockDictionaryService = new DictionaryService();
    registeredHandlers = new Map();

    // Capture registered handlers
    mockedIpcMain.handle.mockImplementation((channel: string, handler: Function) => {
      registeredHandlers.set(channel, handler);
    });

    vi.clearAllMocks();
  });

  describe('registerIpcHandlers', () => {
    it('should register all required IPC handlers', () => {
      // Test Case Name: Register all IPC handlers
      // Description: Tests if all required IPC channels are registered
      // Input: Valid service instances
      // Expected Output: All IPC channels registered
      // Scenario Type: Positive

      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);

      expect(mockedIpcMain.handle).toHaveBeenCalledWith(
        IpcChannels.OPEN_SUBTITLE_FILE,
        expect.any(Function)
      );
      expect(mockedIpcMain.handle).toHaveBeenCalledWith(
        IpcChannels.OPEN_VIDEO_FILE,
        expect.any(Function)
      );
      expect(mockedIpcMain.handle).toHaveBeenCalledWith(
        IpcChannels.PARSE_SUBTITLE_FILE,
        expect.any(Function)
      );
      expect(mockedIpcMain.handle).toHaveBeenCalledWith(
        IpcChannels.LOOKUP_WORD,
        expect.any(Function)
      );
      expect(mockedIpcMain.handle).toHaveBeenCalledWith(
        IpcChannels.CHECK_FILE_EXISTS,
        expect.any(Function)
      );
    });
  });

  describe('OPEN_SUBTITLE_FILE handler', () => {
    beforeEach(() => {
      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);
    });

    it('should return selected file path when user selects file', async () => {
      // Test Case Name: Successful subtitle file selection
      // Description: Tests if the handler returns the selected file path
      // Input: User selects a subtitle file
      // Expected Output: File path string
      // Scenario Type: Positive

      const mockFilePath = '/path/to/subtitle.srt';
      mockedDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [mockFilePath],
      });

      const handler = registeredHandlers.get(IpcChannels.OPEN_SUBTITLE_FILE);
      const result = await handler!();

      expect(result).toBe(mockFilePath);
      expect(mockedDialog.showOpenDialog).toHaveBeenCalledWith({
        title: '选择字幕文件',
        filters: [
          { name: '字幕文件', extensions: ['srt', 'ass', 'ssa', 'vtt'] },
          { name: '所有文件', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
    });

    it('should return null when user cancels dialog', async () => {
      // Test Case Name: User cancels file dialog
      // Description: Tests if the handler returns null when user cancels
      // Input: User cancels the file dialog
      // Expected Output: null
      // Scenario Type: Negative

      mockedDialog.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = registeredHandlers.get(IpcChannels.OPEN_SUBTITLE_FILE);
      const result = await handler!();

      expect(result).toBeNull();
    });

    it('should return null when no files selected', async () => {
      // Test Case Name: No files selected
      // Description: Tests if the handler returns null when no files are selected
      // Input: Dialog returns with no file paths
      // Expected Output: null
      // Scenario Type: Edge

      mockedDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [],
      });

      const handler = registeredHandlers.get(IpcChannels.OPEN_SUBTITLE_FILE);
      const result = await handler!();

      expect(result).toBeNull();
    });
  });

  describe('OPEN_VIDEO_FILE handler', () => {
    beforeEach(() => {
      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);
    });

    it('should return selected video file path', async () => {
      // Test Case Name: Successful video file selection
      // Description: Tests if the handler returns the selected video file path
      // Input: User selects a video file
      // Expected Output: Video file path string
      // Scenario Type: Positive

      const mockFilePath = '/path/to/video.mp4';
      mockedDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [mockFilePath],
      });

      const handler = registeredHandlers.get(IpcChannels.OPEN_VIDEO_FILE);
      const result = await handler!();

      expect(result).toBe(mockFilePath);
      expect(mockedDialog.showOpenDialog).toHaveBeenCalledWith({
        title: '选择视频文件',
        filters: [
          {
            name: '视频文件',
            extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
          },
          { name: '所有文件', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });
    });
  });

  describe('PARSE_SUBTITLE_FILE handler', () => {
    beforeEach(() => {
      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);
    });

    it('should call subtitle parser service with correct file path', async () => {
      // Test Case Name: Parse subtitle file
      // Description: Tests if the handler calls the subtitle parser with the correct file path
      // Input: Valid subtitle file path
      // Expected Output: Parse result from service
      // Scenario Type: Positive

      const mockFilePath = '/path/to/subtitle.srt';
      const mockParseResult = { success: true, data: { entries: [], words: [] } };

      vi.spyOn(mockSubtitleParser, 'parseFile').mockResolvedValue(mockParseResult);

      const handler = registeredHandlers.get(IpcChannels.PARSE_SUBTITLE_FILE);
      const result = await handler!(null, mockFilePath);

      expect(mockSubtitleParser.parseFile).toHaveBeenCalledWith(mockFilePath);
      expect(result).toBe(mockParseResult);
    });
  });

  describe('LOOKUP_WORD handler', () => {
    beforeEach(() => {
      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);
    });

    it('should call dictionary service with correct word', async () => {
      // Test Case Name: Lookup word
      // Description: Tests if the handler calls the dictionary service with the correct word
      // Input: Valid word string
      // Expected Output: Dictionary entry from service
      // Scenario Type: Positive

      const mockWord = 'hello';
      const mockDictionaryEntry = { word: 'hello', meanings: [], examples: [] };

      vi.spyOn(mockDictionaryService, 'lookupWord').mockResolvedValue(mockDictionaryEntry);

      const handler = registeredHandlers.get(IpcChannels.LOOKUP_WORD);
      const result = await handler!(null, mockWord);

      expect(mockDictionaryService.lookupWord).toHaveBeenCalledWith(mockWord);
      expect(result).toBe(mockDictionaryEntry);
    });
  });

  describe('CHECK_FILE_EXISTS handler', () => {
    beforeEach(() => {
      registerIpcHandlers(mockSubtitleParser, mockDictionaryService);
    });

    it('should return true for existing file', async () => {
      // Test Case Name: Check existing file
      // Description: Tests if the handler correctly identifies existing files
      // Input: Path to existing file
      // Expected Output: true      // Scenario Type: Positive

      const mockFilePath = '/path/to/existing/file.mp4';
      const mockedFsPromises = fs.promises as any;
      mockedFsPromises.access.mockResolvedValue(undefined);

      const handler = registeredHandlers.get(IpcChannels.CHECK_FILE_EXISTS);
      const result = await handler!(null, mockFilePath);

      expect(mockedFsPromises.access).toHaveBeenCalledWith(mockFilePath, fs.constants.F_OK);
      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      // Test Case Name: Check non-existing file
      // Description: Tests if the handler correctly identifies non-existing files
      // Input: Path to non-existing file
      // Expected Output: false
      // Scenario Type: Negative

      const mockFilePath = '/path/to/nonexisting/file.mp4';
      const mockedFsPromises = fs.promises as any;
      mockedFsPromises.access.mockRejectedValue(new Error('File not found'));
      const handler = registeredHandlers.get(IpcChannels.CHECK_FILE_EXISTS);
      const result = await handler!(null, mockFilePath);

      expect(mockedFsPromises.access).toHaveBeenCalledWith(mockFilePath, fs.constants.F_OK);
      expect(result).toBe(false);
    });
  });
});
