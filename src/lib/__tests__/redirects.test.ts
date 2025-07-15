import { redirect301, createRedirect301 } from '../redirects';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn()
  }
}));

describe('Redirects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('redirect301', () => {
    it('should create a 301 redirect response', () => {
      const mockResponse = { status: 301 };
      (NextResponse.redirect as jest.Mock).mockReturnValue(mockResponse);

      const result = redirect301('https://example.com/new-path');

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        'https://example.com/new-path',
        301
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle different URLs', () => {
      const mockResponse = { status: 301 };
      (NextResponse.redirect as jest.Mock).mockReturnValue(mockResponse);

      redirect301('/blog/new-post');
      expect(NextResponse.redirect).toHaveBeenCalledWith('/blog/new-post', 301);

      redirect301('https://external-site.com');
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        'https://external-site.com',
        301
      );
    });
  });

  describe('createRedirect301', () => {
    it('should create a 301 redirect with proper URL construction', () => {
      const mockResponse = { status: 301 };
      (NextResponse.redirect as jest.Mock).mockReturnValue(mockResponse);

      const mockRequest = {
        url: 'https://example.com/old-path'
      } as Request;

      const result = createRedirect301(mockRequest, '/new-path');

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/new-path', 'https://example.com/old-path'),
        301
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle relative paths correctly', () => {
      const mockResponse = { status: 301 };
      (NextResponse.redirect as jest.Mock).mockReturnValue(mockResponse);

      const mockRequest = {
        url: 'https://wesleyk.me/blog/old-post'
      } as Request;

      createRedirect301(mockRequest, '/blog/new-post');

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('/blog/new-post', 'https://wesleyk.me/blog/old-post'),
        301
      );
    });

    it('should handle absolute URLs', () => {
      const mockResponse = { status: 301 };
      (NextResponse.redirect as jest.Mock).mockReturnValue(mockResponse);

      const mockRequest = {
        url: 'https://wesleyk.me/old-path'
      } as Request;

      createRedirect301(mockRequest, 'https://wesleyk.me/new-path');

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('https://wesleyk.me/new-path', 'https://wesleyk.me/old-path'),
        301
      );
    });
  });
});
