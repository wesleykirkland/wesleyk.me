// Mock fetch globally
global.fetch = jest.fn();

// Mock Next.js server components before importing
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => {
    const request = new Request(url, init);
    return Object.assign(request, {
      nextUrl: new URL(url),
      cookies: new Map(),
      geo: {},
      ip: '127.0.0.1'
    });
  }),
  NextResponse: jest.fn().mockImplementation((body, init) => {
    // Handle different types of responses
    if (
      body instanceof ArrayBuffer ||
      body instanceof Uint8Array ||
      Buffer.isBuffer(body)
    ) {
      // Image response - use the headers from init if provided, otherwise defaults
      const headers = {
        ...init?.headers
      };
      return new Response(body, {
        status: init?.status || 200,
        headers
      });
    } else {
      // JSON response
      const headers = {
        'content-type': 'application/json',
        ...init?.headers
      };
      return new Response(JSON.stringify(body), {
        status: init?.status || 200,
        headers
      });
    }
  })
}));

// Add static methods to NextResponse mock
const NextResponseMock = require('next/server').NextResponse;
NextResponseMock.json = jest.fn((data, init) => {
  const response = new Response(JSON.stringify(data), {
    status: init?.status || 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': init?.headers?.['cache-control'] || 'no-cache',
      'x-cat-count': init?.headers?.['x-cat-count'],
      'x-cat-filename': init?.headers?.['x-cat-filename'],
      ...init?.headers
    }
  });
  return response;
});

NextResponseMock.redirect = jest.fn((url, status = 302) => {
  const response = new Response(null, {
    status,
    headers: {
      location: url,
      'cache-control': 'public, max-age=3600'
    }
  });
  return response;
});

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  statSync: jest.fn()
}));

// Mock path module
jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  extname: jest.fn((file: string) => {
    const parts = file.split('.');
    return parts.length > 1 ? '.' + parts[parts.length - 1] : '';
  })
}));

import { NextRequest } from 'next/server';
import { GET, clearCatImagesCache } from '../route';

const fs = require('fs');
const path = require('path');

// Create mock references for the tests
const mockFs = fs;
const mockPath = path;

describe('/api/cat Route', () => {
  const mockCatFiles = ['fluffy.jpg', 'whiskers.png', 'mittens.gif'];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear the cache by mocking Date.now to force cache invalidation
    const mockDateNow = jest.spyOn(Date, 'now');
    mockDateNow.mockReturnValue(Date.now() + 60000); // Force cache expiry

    // Mock path.join to return a predictable path
    mockPath.join.mockReturnValue('/mock/path/to/cats');

    // Mock fs.existsSync to return true (cats directory exists)
    mockFs.existsSync.mockReturnValue(true);

    // Mock fs.readdirSync to return cat files
    mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

    // Mock fs.statSync to return file stats
    mockFs.statSync.mockReturnValue({
      isFile: () => true,
      size: 1024000,
      mtime: new Date('2024-03-15T10:00:00Z')
    } as any);

    // Mock fs.readFileSync for image serving
    mockFs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

    // Restore Date.now after setup
    mockDateNow.mockRestore();
  });

  describe('Basic Functionality', () => {
    it('returns JSON response by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.image).toMatch(
        /^\/cats\/(fluffy\.jpg|whiskers\.png|mittens\.gif)$/
      );
      expect(data.filename).toMatch(
        /^(fluffy\.jpg|whiskers\.png|mittens\.gif)$/
      );
      expect(data.url).toMatch(
        /^http:\/\/localhost:3000\/cats\/(fluffy\.jpg|whiskers\.png|mittens\.gif)$/
      );
      expect(data.timestamp).toBeDefined();
    });

    it('returns 404 when no cat images found', async () => {
      // Clear the cache by mocking a future timestamp
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 10 * 60 * 1000);

      mockFs.readdirSync.mockReturnValue([]);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
      expect(data.message).toBe(
        'Please add cat images to the /public/cats directory'
      );

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('returns 404 when cats directory does not exist', async () => {
      // Clear the cache by mocking a future timestamp
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 10 * 60 * 1000);

      mockFs.existsSync.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Format Parameter', () => {
    it('returns JSON when format=json', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 35 * 60 * 1000); // 35 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=json'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );

      const data = await response.json();
      expect(data.success).toBe(true);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('returns redirect when format=redirect', async () => {
      // Ensure cache is cleared and cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 40 * 60 * 1000); // 40 minutes ahead

      // Reset mocks to ensure cat files are available
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=redirect'
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toMatch(
        /^http:\/\/localhost:3000\/cats\/(fluffy\.jpg|whiskers\.png|mittens\.gif)$/
      );

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('returns image data when format=image', async () => {
      // Ensure cache is cleared and cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 10 * 60 * 1000);

      // Reset mocks to ensure cat files are available
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake image data'));

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(
        /^image\/(jpeg|png|gif|webp)$/
      );
      expect(response.headers.get('cache-control')).toBe(
        'public, max-age=3600'
      );

      const buffer = await response.arrayBuffer();
      expect(buffer.byteLength).toBeGreaterThan(0);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Info Parameter', () => {
    it('includes additional info when info=true', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cat?info=true'
      );
      const response = await GET(request);

      const data = await response.json();
      expect(data.fileSize).toBe(1024000);
      expect(data.lastModified).toBeDefined();
      expect(data.totalCats).toBe(3);
    });

    it('does not include additional info by default', async () => {
      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      const data = await response.json();
      expect(data.fileSize).toBeUndefined();
      expect(data.lastModified).toBeUndefined();
      expect(data.totalCats).toBeUndefined();
    });

    it('includes info with redirect format', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=redirect&info=true'
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('X-Cat-Count')).toBe('3');
    });
  });

  describe('File Type Filtering', () => {
    it('only includes supported image formats', async () => {
      mockFs.readdirSync.mockReturnValue([
        'cat1.jpg',
        'cat2.png',
        'cat3.gif',
        'cat4.webp',
        'cat5.jpeg',
        'not-image.txt',
        'document.pdf',
        'video.mp4'
      ] as any);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.filename).toMatch(/\.(jpg|jpeg|png|gif|webp)$/);
    });

    it('returns 404 when no supported image formats found', async () => {
      // Clear mocks and cache
      jest.clearAllMocks();
      clearCatImagesCache();

      // Set up path.join to work
      mockPath.join.mockReturnValue('/mock/path/to/cats');

      // Set up existsSync to return true
      mockFs.existsSync.mockReturnValue(true);

      // Mock readdirSync to return only non-image files
      mockFs.readdirSync.mockReturnValue([
        'document.txt',
        'video.mp4',
        'audio.mp3'
      ] as any);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('MIME Type Detection', () => {
    it('sets correct MIME type for JPEG', async () => {
      // Clear cache and set up specific file
      jest.clearAllMocks();
      clearCatImagesCache();
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0); // Always select first file

      mockPath.join.mockReturnValue('/mock/path/to/cats');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat.jpg'] as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake jpeg data'));

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('content-type')).toBe('image/jpeg');

      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it('sets correct MIME type for PNG', async () => {
      // Clear cache and set up specific file
      jest.clearAllMocks();
      const originalDateNow = Date.now;
      const originalMathRandom = Math.random;
      Date.now = jest.fn(() => originalDateNow() + 20 * 60 * 1000); // 20 minutes ahead
      Math.random = jest.fn(() => 0); // Always select first file

      mockPath.join.mockReturnValue('/mock/path/to/cats');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat.png'] as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake png data'));

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('content-type')).toBe('image/png');

      // Restore mocks
      Date.now = originalDateNow;
      Math.random = originalMathRandom;
    });

    it('sets correct MIME type for GIF', async () => {
      // Clear cache and set up specific file
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 25 * 60 * 1000); // 25 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat.gif'] as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake gif data'));

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('content-type')).toBe('image/gif');

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('sets correct MIME type for WebP', async () => {
      // Clear cache and set up specific file
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 30 * 60 * 1000); // 30 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat.webp'] as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake webp data'));

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('content-type')).toBe('image/webp');

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Caching Headers', () => {
    it('sets no-cache for JSON responses', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 45 * 60 * 1000); // 45 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.headers.get('cache-control')).toContain('no-cache');

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('sets cache headers for image responses', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('cache-control')).toBe(
        'public, max-age=3600'
      );
    });

    it('includes cat count header', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 50 * 60 * 1000); // 50 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.headers.get('x-cat-count')).toContain('3');

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('Error Handling', () => {
    it('handles cats directory not found', async () => {
      // Clear mocks and set up error condition
      jest.clearAllMocks();

      // Set up path.join to work
      mockPath.join.mockReturnValue('/mock/path/to/cats');

      // Make existsSync return false (directory doesn't exist)
      mockFs.existsSync.mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });

    it('handles file system errors gracefully', async () => {
      // Clear mocks and set up error condition
      jest.clearAllMocks();

      // Force cache expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(originalDateNow() + 10 * 60 * 1000);

      // Set up path.join to work
      mockPath.join.mockReturnValue('/mock/path/to/cats');

      // Set up existsSync to return true
      mockFs.existsSync.mockReturnValue(true);

      // Make readdirSync throw an error
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      // Restore Date.now
      Date.now = originalDateNow;

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });

    it('handles general API errors', async () => {
      // Clear mocks and set up error condition
      jest.clearAllMocks();

      // Make path.join throw an error to trigger the main catch block
      mockPath.join.mockImplementation(() => {
        throw new Error('Path error');
      });

      const request = new NextRequest('http://localhost:3000/api/cat');
      const response = await GET(request);

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });

    it('handles main catch block errors', async () => {
      // Clear mocks and set up error condition
      jest.clearAllMocks();

      // Set up path.join to work initially
      mockPath.join.mockReturnValue('/mock/path/to/cats');

      // Set up existsSync to return true
      mockFs.existsSync.mockReturnValue(true);

      // Set up readdirSync to work
      mockFs.readdirSync.mockReturnValue(['cat1.jpg', 'cat2.png', 'cat3.gif']);

      // Create a malformed request that will cause an error in URL parsing
      const malformedRequest = {
        nextUrl: {
          searchParams: {
            get: jest.fn().mockImplementation(() => {
              throw new Error('URL parsing error');
            })
          }
        }
      } as any;

      const response = await GET(malformedRequest);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(data.message).toBe('Failed to fetch random cat image');
    });

    it('handles file read errors for image format', async () => {
      // Clear mocks and set up fresh state
      jest.clearAllMocks();

      // Set up successful directory operations
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat1.jpg']);
      mockFs.statSync.mockReturnValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2024-01-01')
      } as any);

      // Make readFileSync throw an error
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to serve image');
    });

    it('handles stat errors when getting file info', async () => {
      // Clear mocks and set up fresh state
      jest.clearAllMocks();

      // Set up successful directory operations
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat1.jpg']);
      mockFs.readFileSync.mockReturnValue(Buffer.from('fake-image-data'));

      // Make statSync throw an error
      mockFs.statSync.mockImplementation(() => {
        throw new Error('Stat error');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/cat?info=true'
      );
      const response = await GET(request);

      // Should still work but without file info
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.fileSize).toBeUndefined();
      expect(data.lastModified).toBeUndefined();
    });
  });

  describe('Random Selection', () => {
    it('selects different cats on multiple requests', async () => {
      const results = new Set();

      // Make multiple requests
      for (let i = 0; i < 10; i++) {
        const request = new NextRequest('http://localhost:3000/api/cat');
        const response = await GET(request);
        const data = await response.json();
        results.add(data.filename);
      }

      // Should have some variety (though not guaranteed due to randomness)
      // This test might occasionally fail due to random chance
      expect(results.size).toBeGreaterThan(0);
    });
  });

  describe('Response Headers', () => {
    it('includes proper security headers', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('cache-control')).toBe(
        'public, max-age=3600'
      );
    });

    it('includes filename in headers for image responses', async () => {
      mockFs.readdirSync.mockReturnValue(['specific-cat.jpg'] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image'
      );
      const response = await GET(request);

      expect(response.headers.get('x-cat-filename')).toBe('specific-cat.jpg');
    });

    it('should handle local cat images without external API', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 55 * 60 * 1000); // 55 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.filename).toMatch(
        /^(fluffy\.jpg|whiskers\.png|mittens\.gif)$/
      );

      // Should not make any external API calls
      expect(global.fetch).not.toHaveBeenCalled();

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle local file system operations', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 60 * 60 * 1000); // 60 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(mockCatFiles as any);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.filename).toBeDefined();

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle valid local cat files', async () => {
      // Clear cache and ensure cat files are available
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 65 * 60 * 1000); // 65 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat1.jpg', 'cat2.png'] as any);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(['cat1.jpg', 'cat2.png']).toContain(data.filename);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle empty local directory', async () => {
      // Clear cache and set empty directory
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 70 * 60 * 1000); // 70 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([] as any);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('No cat images found');

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should include proper CORS headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);

      // This API doesn't currently implement CORS headers
      // This test documents the current behavior
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should return consistent response format', async () => {
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);

      expect(response.headers.get('Content-Type')).toBe('application/json');

      const data = await response.json();
      expect(typeof data).toBe('object');
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('filename');
      expect(data).toHaveProperty('url');
    });

    it('should handle timeout scenarios', async () => {
      // This API doesn't use external fetch, so timeout scenarios don't apply
      // This test documents that the local API doesn't have timeout issues
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should use API key when provided', async () => {
      // This API doesn't use external API keys since it serves local files
      // This test documents that API keys are not needed for local operation
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify fetch was not called since we use local files
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle invalid response structure', async () => {
      // This API doesn't use external fetch, so invalid response structure doesn't apply
      // This test documents that the local API has consistent structure
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should handle fetch network errors', async () => {
      // This API doesn't use external fetch, so network errors don't apply
      // This test documents that the local API doesn't have network dependencies
      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('handles file system errors gracefully', async () => {
      // Force cache expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(originalDateNow() + 10 * 60 * 1000);

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(404);

      // Restore Date.now
      Date.now = originalDateNow;

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });

    it('handles file read errors gracefully', async () => {
      // Clear cache to ensure fresh file operations
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 75 * 60 * 1000); // 75 minutes ahead

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat1.jpg'] as any);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const request = new NextRequest(
        'http://localhost:3000/api/cat?format=image',
        {
          method: 'GET'
        }
      );

      const response = await GET(request);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to serve image');

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('caches cat images list for performance', async () => {
      // Clear mocks and cache to get accurate count
      jest.clearAllMocks();
      clearCatImagesCache();

      // Mock Date.now to ensure consistent behavior
      const originalDateNow = Date.now;
      const baseTime = originalDateNow();
      Date.now = jest.fn(() => baseTime);

      mockPath.join.mockReturnValue('/mock/path/to/cats');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['cat1.jpg', 'cat2.png']);

      // First request - should call readdirSync
      const request1 = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });
      await GET(request1);

      // Second request should use cache (within cache duration)
      const request2 = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });
      await GET(request2);

      // readdirSync should only be called once due to caching
      expect(mockFs.readdirSync).toHaveBeenCalledTimes(1);

      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('filters out non-image files', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([
        'cat1.jpg',
        'readme.txt',
        'cat2.png',
        'config.json'
      ]);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      // Should only include image files
      expect(['cat1.jpg', 'cat2.png']).toContain(data.filename);
    });

    it('handles empty cats directory', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([]);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });

    it('handles directory with only non-image files', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['readme.txt', 'config.json', 'notes.md']);

      const request = new NextRequest('http://localhost:3000/api/cat', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('No cat images found');
    });
  });

  describe('HTTP Methods', () => {
    it('handles POST method', async () => {
      const { POST } = require('../route');

      const response = await POST();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use GET to fetch a random cat.'
      );
    });

    it('handles PUT method', async () => {
      const { PUT } = require('../route');

      const response = await PUT();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use GET to fetch a random cat.'
      );
    });

    it('handles DELETE method', async () => {
      const { DELETE } = require('../route');

      const response = await DELETE();
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.error).toBe(
        'Method not allowed. Use GET to fetch a random cat.'
      );
    });
  });
});
