import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DictionaryService } from '../../../src/main/services/dictionaryService';

// Mock bing-translate-api with correct structure
vi.mock('bing-translate-api', () => ({
  translate: vi.fn().mockImplementation(async (text) => ({
    translation: `翻译的${text}`,
  })),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DictionaryService', () => {
  let service: DictionaryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DictionaryService();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      // Test Case Name: Service initialization
      // Description: Tests if the service initializes without errors
      // Input: None
      // Expected Output: No errors thrown
      // Scenario Type: Positive

      await expect(service.initialize()).resolves.toBeUndefined();
    });
  });
  describe('lookupWord', () => {
    it('should lookup word successfully with valid API response', async () => {
      // Test Case Name: Successful word lookup
      // Description: Tests if the service returns correct dictionary entry for a valid word
      // Input: Valid English word
      // Expected Output: DictionaryEntry object with word data
      // Scenario Type: Positive

      const mockApiResponse = [
        {
          word: 'hello',
          phonetics: [{ text: '/həˈloʊ/' }],
          meanings: [
            {
              partOfSpeech: 'exclamation',
              definitions: [
                {
                  definition: 'Used as a greeting or to begin a phone conversation',
                  example: 'Hello, John, how are you?',
                  synonyms: ['hi', 'hey'],
                  antonyms: ['goodbye'],
                },
              ],
            },
          ],
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const result = await service.lookupWord('hello');

      expect(result).toBeDefined();
      expect(result?.word).toBe('hello');
      expect(result?.phonetic).toBe('/həˈloʊ/');
      expect(result?.meanings).toHaveLength(1);
      expect(result?.meanings[0].partOfSpeech).toBe('exclamation');
    });

    it('should return null for empty word', async () => {
      // Test Case Name: Empty word input
      // Description: Tests if the service handles empty word input gracefully
      // Input: Empty string
      // Expected Output: null
      // Scenario Type: Edge

      const result = await service.lookupWord('');

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null for whitespace-only word', async () => {
      // Test Case Name: Whitespace-only word input
      // Description: Tests if the service handles whitespace-only input gracefully
      // Input: String with only whitespace
      // Expected Output: null
      // Scenario Type: Edge

      const result = await service.lookupWord('   ');

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      // Test Case Name: API error handling
      // Description: Tests if the service handles API errors gracefully
      // Input: Valid word but API returns error
      // Expected Output: null
      // Scenario Type: Negative

      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.lookupWord('nonexistentword');

      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      // Test Case Name: Network error handling
      // Description: Tests if the service handles network failures gracefully
      // Input: Valid word but network error
      // Expected Output: null
      // Scenario Type: Negative

      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.lookupWord('hello');

      expect(result).toBeNull();
    });

    it('should handle timeout', async () => {
      // Test Case Name: Request timeout handling
      // Description: Tests if the service handles request timeouts gracefully
      // Input: Valid word but request times out
      // Expected Output: null
      // Scenario Type: Edge

      // Mock a timeout scenario
      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 100);
          })
      );

      const result = await service.lookupWord('hello');

      expect(result).toBeNull();
    });

    it('should normalize word input', async () => {
      // Test Case Name: Word input normalization
      // Description: Tests if the service normalizes word input (lowercase, trim)
      // Input: Word with mixed case and whitespace
      // Expected Output: Correct API call with normalized word
      // Scenario Type: Positive

      const mockApiResponse = [
        {
          word: 'test',
          phonetics: [],
          meanings: [],
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      await service.lookupWord('  TEST  ');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object));
    });

    it('should handle API response with missing fields', async () => {
      // Test Case Name: Incomplete API response handling
      // Description: Tests if the service handles API responses with missing fields      // Input: Valid word but incomplete API response
      // Expected Output: DictionaryEntry with available data, null for missing fields
      // Scenario Type: Edge

      const mockApiResponse = [
        {
          word: 'test',
          phonetics: [], // Empty phonetics array instead of missing field
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'A test definition',
                },
              ],
            },
          ],
        },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(mockApiResponse),
        text: () => Promise.resolve(JSON.stringify(mockApiResponse)),
      } as Response);

      const result = await service.lookupWord('test');

      expect(result).toBeDefined();
      expect(result?.word).toBe('test');
      expect(result?.phonetic).toBeUndefined();
      expect(result?.meanings).toHaveLength(1);
    });
  });
});
