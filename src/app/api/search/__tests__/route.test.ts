import { GET, POST, PUT, DELETE } from '../route';
import { NextRequest } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
      headers: new Map()
    }))
  }
}));

// Mock the blog functions
jest.mock('@/lib/blog', () => ({
  searchPosts: jest.fn(),
  getSearchSuggestions: jest.fn(),
  getAllTags: jest.fn()
}));

import { searchPosts, getSearchSuggestions, getAllTags } from '@/lib/blog';

const mockSearchPosts = searchPosts as jest.MockedFunction<typeof searchPosts>;
const mockGetSearchSuggestions = getSearchSuggestions as jest.MockedFunction<
  typeof getSearchSuggestions
>;
const mockGetAllTags = getAllTags as jest.MockedFunction<typeof getAllTags>;

// Helper function to create mock request
function createMockRequest(url: string) {
  return {
    url,
    nextUrl: new URL(url)
  } as NextRequest;
}

describe('/api/search Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET Method', () => {
    it('should perform basic search', async () => {
      const mockResults = [
        {
          post: {
            slug: 'test-post',
            title: 'Test Post',
            excerpt: 'Test excerpt',
            tags: ['test'],
            date: '2024-01-01',
            author: 'Test Author'
          },
          relevanceScore: 10,
          matchedFields: ['title']
        }
      ];

      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.results).toEqual(mockResults);
      expect(data.query).toBe('test');
      expect(data.totalResults).toBe(1);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        tags: undefined,
        includeContent: false,
        limit: undefined
      });
    });

    it('should handle search with tags', async () => {
      const mockResults = [];
      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test&tags=javascript,react'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.tags).toEqual(['javascript', 'react']);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        tags: ['javascript', 'react'],
        includeContent: false,
        limit: undefined
      });
    });

    it('should handle search with content inclusion', async () => {
      const mockResults = [];
      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test&content=true'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.includeContent).toBe(true);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        tags: undefined,
        includeContent: true,
        limit: undefined
      });
    });

    it('should handle search with limit', async () => {
      const mockResults = [];
      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test&limit=5'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        tags: undefined,
        includeContent: false,
        limit: 5
      });
    });

    it('should handle suggestions request', async () => {
      const mockSuggestions = ['JavaScript Tutorial', 'React Guide'];
      mockGetSearchSuggestions.mockReturnValue(mockSuggestions);

      const request = createMockRequest(
        'http://localhost:3000/api/search?type=suggestions&q=java'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.suggestions).toEqual(mockSuggestions);

      expect(mockGetSearchSuggestions).toHaveBeenCalledWith('java', 5);
    });

    it('should handle suggestions with custom limit', async () => {
      const mockSuggestions = ['JavaScript Tutorial'];
      mockGetSearchSuggestions.mockReturnValue(mockSuggestions);

      const request = createMockRequest(
        'http://localhost:3000/api/search?type=suggestions&q=java&limit=1'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);

      expect(mockGetSearchSuggestions).toHaveBeenCalledWith('java', 1);
    });

    it('should handle tags request', async () => {
      const mockTags = ['JavaScript', 'React', 'Node.js'];
      mockGetAllTags.mockReturnValue(mockTags);

      const request = createMockRequest(
        'http://localhost:3000/api/search?type=tags'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.tags).toEqual(mockTags);

      expect(mockGetAllTags).toHaveBeenCalled();
    });

    it('should handle empty search query', async () => {
      const mockResults = [];
      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest('http://localhost:3000/api/search');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.query).toBe('');
      expect(data.results).toEqual([]);
    });

    it('should handle search errors', async () => {
      mockSearchPosts.mockImplementation(() => {
        throw new Error('Search failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test'
      );
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error during search');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Search API error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should filter empty tags', async () => {
      const mockResults = [];
      mockSearchPosts.mockReturnValue(mockResults);

      const request = createMockRequest(
        'http://localhost:3000/api/search?q=test&tags=javascript,,react,'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);

      expect(mockSearchPosts).toHaveBeenCalledWith({
        query: 'test',
        tags: ['javascript', 'react'],
        includeContent: false,
        limit: undefined
      });
    });
  });

  describe('HTTP Methods', () => {
    it('should return method not allowed for POST requests', async () => {
      const response = await POST();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe('Method not allowed. Use GET to search posts.');
    });

    it('should return method not allowed for PUT requests', async () => {
      const response = await PUT();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe('Method not allowed. Use GET to search posts.');
    });

    it('should return method not allowed for DELETE requests', async () => {
      const response = await DELETE();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe('Method not allowed. Use GET to search posts.');
    });
  });
});
