import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubtitleParserService } from '../../../src/main/services/subtitleParser';
import * as fs from 'fs/promises';

// Mock fs module
vi.mock('fs/promises');
const mockedFs = vi.mocked(fs);

describe('SubtitleParserService', () => {
  let service: SubtitleParserService;

  beforeEach(() => {
    service = new SubtitleParserService();
    vi.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should parse SRT file successfully', async () => {
      // Test Case Name: Parse valid SRT file
      // Description: Tests if the service can parse a well-formed SRT file
      // Input: Valid SRT file path and content
      // Expected Output: ParseResult with success=true and parsed data
      // Scenario Type: Positive

      const srtContent = `1
00:00:01,000 --> 00:00:04,000
Hello world

2
00:00:05,000 --> 00:00:08,000
This is a test subtitle`;

      mockedFs.readFile.mockResolvedValue(srtContent);

      const result = await service.parseFile('/test/file.srt');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.entries).toHaveLength(2);
      expect(result.data?.entries[0].text).toBe('Hello world');
      expect(result.data?.entries[1].text).toBe('This is a test subtitle');
      expect(result.data?.words).toBeDefined();
    });

    it('should parse ASS file successfully', async () => {
      // Test Case Name: Parse valid ASS file
      // Description: Tests if the service can parse a well-formed ASS file
      // Input: Valid ASS file path and content
      // Expected Output: ParseResult with success=true and parsed data
      // Scenario Type: Positive

      const assContent = `[Script Info]
Title: Test

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,16,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Hello world
Dialogue: 0,0:00:05.00,0:00:08.00,Default,,0,0,0,,This is a test`;

      mockedFs.readFile.mockResolvedValue(assContent);

      const result = await service.parseFile('/test/file.ass');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.entries).toHaveLength(2);
      expect(result.data?.entries[0].text).toBe('Hello world');
    });

    it('should reject unsupported file format', async () => {
      // Test Case Name: Reject unsupported file format
      // Description: Tests if the service rejects files with unsupported extensions
      // Input: File path with unsupported extension
      // Expected Output: ParseResult with success=false and error message
      // Scenario Type: Negative

      const result = await service.parseFile('/test/file.txt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('不支持的字幕文件格式');
    });

    it('should handle file read errors', async () => {
      // Test Case Name: Handle file read errors
      // Description: Tests if the service handles file system errors gracefully
      // Input: File path that causes read error
      // Expected Output: ParseResult with success=false and error message
      // Scenario Type: Edge

      mockedFs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await service.parseFile('/nonexistent/file.srt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should handle malformed SRT content', async () => {
      // Test Case Name: Handle malformed SRT content
      // Description: Tests if the service handles invalid SRT format gracefully
      // Input: Malformed SRT content
      // Expected Output: ParseResult with success=true but empty or minimal data
      // Scenario Type: Edge

      const malformedSrt = 'This is not a valid SRT format';
      mockedFs.readFile.mockResolvedValue(malformedSrt);

      const result = await service.parseFile('/test/malformed.srt');

      expect(result.success).toBe(true);
      expect(result.data?.entries).toBeDefined();
      // Should handle gracefully, possibly with empty entries
    });
  });

  describe('word extraction', () => {
    it('should extract unique words correctly', async () => {
      // Test Case Name: Extract unique words from subtitles
      // Description: Tests if the service correctly extracts and counts words
      // Input: SRT content with repeated words
      // Expected Output: Word list with correct counts
      // Scenario Type: Positive

      const srtContent = `1
00:00:01,000 --> 00:00:04,000
Hello world hello

2
00:00:05,000 --> 00:00:08,000
World test hello`;

      mockedFs.readFile.mockResolvedValue(srtContent);

      const result = await service.parseFile('/test/file.srt');

      expect(result.success).toBe(true);
      expect(result.data?.words).toBeDefined();

      const helloWord = result.data?.words.find((w) => w.original === 'hello');
      const worldWord = result.data?.words.find((w) => w.original === 'world');

      expect(helloWord?.count).toBe(3);
      expect(worldWord?.count).toBe(2);
    });

    it('should filter out HTML tags and special characters', async () => {
      // Test Case Name: Filter HTML tags and special characters
      // Description: Tests if the service removes HTML tags from text before word extraction
      // Input: SRT content with HTML tags and special characters
      // Expected Output: Clean word extraction without tags
      // Scenario Type: Edge

      const srtContent = `1
00:00:01,000 --> 00:00:04,000
<i>Hello</i> <b>world</b> with 123 numbers

2
00:00:05,000 --> 00:00:08,000
{Test} content`;

      mockedFs.readFile.mockResolvedValue(srtContent);

      const result = await service.parseFile('/test/file.srt');

      expect(result.success).toBe(true);
      expect(result.data?.words).toBeDefined();

      const words = result.data?.words.map((w) => w.original) || [];
      expect(words).toContain('hello');
      expect(words).toContain('world');
      expect(words).toContain('with');
      expect(words).toContain('test');
      expect(words).toContain('content');
      expect(words).not.toContain('123');
      expect(words).not.toContain('{test}');
    });
  });
});
