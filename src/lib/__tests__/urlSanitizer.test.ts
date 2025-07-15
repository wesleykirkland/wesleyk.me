import {
  sanitizeUrl,
  sanitizeCatUrl,
  sanitizeBlogUrl,
  sanitizeExternalUrl
} from '../urlSanitizer';

// Mock console methods
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('URL Sanitizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('sanitizeUrl', () => {
    it('should return empty string for invalid inputs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null as unknown as string)).toBe('');
      expect(sanitizeUrl(undefined as unknown as string)).toBe('');
      expect(sanitizeUrl(123 as unknown as string)).toBe('');
    });

    it('should allow valid HTTP and HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should block dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Blocked potentially dangerous URL protocol:',
        expect.any(String)
      );
    });

    it('should handle relative URLs', () => {
      expect(sanitizeUrl('/blog/post')).toBe('http://localhost/blog/post');
      expect(sanitizeUrl('./relative')).toBe('http://localhost/relative');
    });

    it('should respect allowed paths for same-origin URLs', () => {
      const allowedPaths = ['/blog/', '/api/'];

      expect(sanitizeUrl('/blog/post', allowedPaths)).toBe(
        'http://localhost/blog/post'
      );
      expect(sanitizeUrl('/api/data', allowedPaths)).toBe(
        'http://localhost/api/data'
      );
      expect(sanitizeUrl('/admin/panel', allowedPaths)).toBe('');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Blocked URL outside allowed paths:',
        '/admin/panel'
      );
    });

    it('should respect allowed domains for external URLs', () => {
      const allowedDomains = ['example.com', 'trusted.org'];

      expect(
        sanitizeUrl('https://example.com/page', undefined, allowedDomains)
      ).toBe('https://example.com/page');
      expect(
        sanitizeUrl('https://sub.example.com/page', undefined, allowedDomains)
      ).toBe('https://sub.example.com/page');
      expect(
        sanitizeUrl('https://malicious.com/page', undefined, allowedDomains)
      ).toBe('');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Blocked URL from disallowed domain:',
        'malicious.com'
      );
    });

    it('should handle malformed URLs', () => {
      // 'not-a-url' gets treated as a relative URL and becomes valid
      expect(sanitizeUrl('not-a-url')).toBe('http://localhost/not-a-url');
      expect(sanitizeUrl('http://')).toBe('');
      expect(sanitizeUrl('https://[invalid')).toBe('');

      // The function should return empty strings for invalid URLs
      // Console errors are handled by jest setup but we can't easily test them
    });

    it('should allow all paths when no allowedPaths specified', () => {
      expect(sanitizeUrl('/any/path')).toBe('http://localhost/any/path');
      expect(sanitizeUrl('/admin/secret')).toBe(
        'http://localhost/admin/secret'
      );
    });

    it('should allow all domains when no allowedDomains specified', () => {
      expect(sanitizeUrl('https://any-domain.com')).toBe(
        'https://any-domain.com/'
      );
      expect(sanitizeUrl('https://malicious.evil')).toBe(
        'https://malicious.evil/'
      );
    });
  });

  describe('sanitizeCatUrl', () => {
    it('should allow cat-related paths', () => {
      expect(sanitizeCatUrl('/cats/fluffy.jpg')).toBe(
        'http://localhost/cats/fluffy.jpg'
      );
      expect(sanitizeCatUrl('/api/cat')).toBe('http://localhost/api/cat');
    });

    it('should block non-cat paths', () => {
      expect(sanitizeCatUrl('/blog/post')).toBe('');
      expect(sanitizeCatUrl('/admin/panel')).toBe('');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Blocked URL outside allowed paths:',
        expect.any(String)
      );
    });
  });

  describe('sanitizeBlogUrl', () => {
    it('should allow blog-related paths', () => {
      expect(sanitizeBlogUrl('/blog/my-post')).toBe(
        'http://localhost/blog/my-post'
      );
      expect(sanitizeBlogUrl('/tag/javascript')).toBe(
        'http://localhost/tag/javascript'
      );
      expect(sanitizeBlogUrl('/api/search')).toBe(
        'http://localhost/api/search'
      );
      expect(sanitizeBlogUrl('/')).toBe('http://localhost/');
    });

    it('should allow all paths since "/" is in allowedPaths', () => {
      // Since '/' is in the allowed paths, all paths are allowed
      expect(sanitizeBlogUrl('/admin/panel')).toBe(
        'http://localhost/admin/panel'
      );
      expect(sanitizeBlogUrl('/cats/fluffy.jpg')).toBe(
        'http://localhost/cats/fluffy.jpg'
      );
    });
  });

  describe('sanitizeExternalUrl', () => {
    it('should allow default trusted domains', () => {
      expect(sanitizeExternalUrl('https://github.com/user/repo')).toBe(
        'https://github.com/user/repo'
      );
      expect(sanitizeExternalUrl('https://linkedin.com/in/user')).toBe(
        'https://linkedin.com/in/user'
      );
      expect(sanitizeExternalUrl('https://youtube.com/watch?v=123')).toBe(
        'https://youtube.com/watch?v=123'
      );
    });

    it('should allow additional trusted domains', () => {
      const additionalDomains = ['example.com', 'trusted.org'];

      expect(
        sanitizeExternalUrl('https://example.com/page', additionalDomains)
      ).toBe('https://example.com/page');
      expect(
        sanitizeExternalUrl('https://trusted.org/content', additionalDomains)
      ).toBe('https://trusted.org/content');
    });

    it('should block untrusted domains', () => {
      expect(sanitizeExternalUrl('https://malicious.com/evil')).toBe('');
      expect(sanitizeExternalUrl('https://phishing.site/fake')).toBe('');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Blocked URL from disallowed domain:',
        expect.any(String)
      );
    });

    it('should handle subdomains of trusted domains', () => {
      expect(sanitizeExternalUrl('https://subdomain.github.com/page')).toBe(
        'https://subdomain.github.com/page'
      );
      expect(sanitizeExternalUrl('https://www.linkedin.com/company/123')).toBe(
        'https://www.linkedin.com/company/123'
      );
    });
  });
});
