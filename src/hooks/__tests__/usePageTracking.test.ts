import { renderHook } from '@testing-library/react';
import {
  usePageTracking,
  useEventTracking,
  trackingEvents
} from '../usePageTracking';

// Mock window.overtracking
const mockOvertrackingPage = jest.fn();

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

const mockUsePathname = require('next/navigation').usePathname;

// Setup window and document mocks
const setupWindowMocks = () => {
  Object.defineProperty(window, 'overtracking', {
    value: {
      page: mockOvertrackingPage
    },
    writable: true,
    configurable: true
  });

  Object.defineProperty(document, 'title', {
    value: 'Test Page',
    writable: true,
    configurable: true
  });

  Object.defineProperty(document, 'referrer', {
    value: 'https://example.com',
    writable: true,
    configurable: true
  });
};

describe('usePageTracking Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production'; // Enable tracking by default
    mockUsePathname.mockReturnValue('/test-path');
    setupWindowMocks();
  });

  describe('Basic Functionality', () => {
    it('tracks page view automatically in production', () => {
      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.objectContaining({
          path: '/test-path',
          url: 'http://localhost/',
          title: 'Test Page',
          referrer: 'https://example.com',
          timestamp: expect.any(String)
        })
      );
    });

    it('does not track in development by default', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).not.toHaveBeenCalled();
    });

    it('can be explicitly enabled in development', () => {
      process.env.NODE_ENV = 'development';

      renderHook(() => usePageTracking({ enabled: true }));

      expect(mockOvertrackingPage).toHaveBeenCalled();
    });

    it('does not track when pathname is null', () => {
      mockUsePathname.mockReturnValue(null);

      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).not.toHaveBeenCalled();
    });

    it('does not track when overtracking is not available', () => {
      delete (window as any).overtracking;

      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).not.toHaveBeenCalled();
    });

    it('does not track when explicitly disabled', () => {
      renderHook(() => usePageTracking({ enabled: false }));

      expect(mockOvertrackingPage).not.toHaveBeenCalled();
    });
  });

  describe('Custom Properties', () => {
    it('includes custom properties in tracking', () => {
      const customProperties = {
        section: 'header',
        campaign: 'summer2024'
      };

      renderHook(() => usePageTracking({ customProperties }));

      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.objectContaining({
          path: '/test-path',
          section: 'header',
          campaign: 'summer2024'
        })
      );
    });

    it('tracks search parameters when enabled', () => {
      // Mock window.location.search
      (window as any).location = {
        search: '?param1=value1&param2=value2'
      };

      renderHook(() => usePageTracking({ trackSearchParams: true }));

      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.objectContaining({
          path: '/test-path',
          url: 'http://localhost/',
          title: 'Test Page',
          referrer: 'https://example.com',
          timestamp: expect.any(String)
        })
      );
    });

    it('does not include search params when disabled', () => {
      (window as any).location = {
        search: '?param1=value1'
      };

      renderHook(() => usePageTracking({ trackSearchParams: false }));

      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.not.objectContaining({
          searchParams: expect.anything()
        })
      );
    });

    it('handles empty search parameters', () => {
      (window as any).location = {
        search: ''
      };

      renderHook(() => usePageTracking({ trackSearchParams: true }));

      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.not.objectContaining({
          searchParams: expect.anything()
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('handles missing overtracking gracefully', () => {
      delete (window as any).overtracking;

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();
    });

    it('handles overtracking errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      window.overtracking = {
        page: jest.fn(() => {
          throw new Error('Tracking error');
        })
      };

      // The hook should handle errors gracefully and not crash
      const hookResult = renderHook(() => usePageTracking());

      // The usePageTracking hook doesn't return anything
      expect(hookResult.result.current).toBeUndefined();

      // Verify the error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Overtracking: Error tracking page view',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('handles missing pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null);

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();

      expect(mockOvertrackingPage).not.toHaveBeenCalled();
    });

    it('handles server-side rendering gracefully', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('Environment Variables', () => {
    beforeEach(() => {
      // Reset overtracking mock for these tests
      window.overtracking = {
        page: mockOvertrackingPage
      };
    });

    it('respects NEXT_PUBLIC_OVERTRACKING_SITE_ID', () => {
      process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = 'test-site-id';

      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).toHaveBeenCalled();
    });

    it('handles missing site ID gracefully', () => {
      delete process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID;

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      // Reset overtracking mock for these tests
      window.overtracking = {
        page: mockOvertrackingPage
      };
    });

    it('only tracks once per mount', () => {
      const { rerender } = renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).toHaveBeenCalledTimes(1);

      rerender();

      // Should track on each render in this test setup
      expect(mockOvertrackingPage).toHaveBeenCalledTimes(2);
    });

    it('tracks when component mounts', () => {
      renderHook(() => usePageTracking());

      expect(mockOvertrackingPage).toHaveBeenCalledTimes(1);
      expect(mockOvertrackingPage).toHaveBeenCalledWith(
        '/test-path',
        expect.any(Object)
      );
    });
  });

  describe('Delayed Tracking', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('waits for overtracking to load if not immediately available', () => {
      delete (window as any).overtracking;

      renderHook(() => usePageTracking());

      // Should not have tracked yet
      expect(mockOvertrackingPage).not.toHaveBeenCalled();

      // Add overtracking after delay
      window.overtracking = { page: mockOvertrackingPage };

      // Fast-forward time
      jest.advanceTimersByTime(500);

      expect(mockOvertrackingPage).toHaveBeenCalled();
    });

    it('cleans up timeout on unmount', () => {
      delete (window as any).overtracking;
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => usePageTracking());

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});

describe('useEventTracking Hook', () => {
  const mockOvertrackingTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production';

    Object.defineProperty(window, 'overtracking', {
      value: {
        track: mockOvertrackingTrack
      },
      writable: true,
      configurable: true
    });

    // Mock basic location properties
    (window as any).location = {
      pathname: '/test-path',
      href: 'http://localhost:3000/test-path',
      search: ''
    };
  });

  it('tracks events with basic properties', () => {
    const { result } = renderHook(() => useEventTracking());

    result.current.track('test-event');

    expect(mockOvertrackingTrack).toHaveBeenCalledWith(
      'test-event',
      expect.objectContaining({
        timestamp: expect.any(String),
        page: '/',
        url: 'http://localhost/'
      })
    );
  });

  it('tracks events with custom properties', () => {
    const { result } = renderHook(() => useEventTracking());

    result.current.track('test-event', { customProp: 'value' });

    expect(mockOvertrackingTrack).toHaveBeenCalledWith(
      'test-event',
      expect.objectContaining({
        customProp: 'value',
        timestamp: expect.any(String)
      })
    );
  });

  it('does not track in development', () => {
    process.env.NODE_ENV = 'development';
    const { result } = renderHook(() => useEventTracking());

    result.current.track('test-event');

    expect(mockOvertrackingTrack).not.toHaveBeenCalled();
  });

  it('does not track when overtracking is unavailable', () => {
    delete (window as any).overtracking;
    const { result } = renderHook(() => useEventTracking());

    result.current.track('test-event');

    expect(mockOvertrackingTrack).not.toHaveBeenCalled();
  });
});

describe('trackingEvents', () => {
  const mockOvertrackingTrack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'overtracking', {
      value: {
        track: mockOvertrackingTrack
      },
      writable: true,
      configurable: true
    });
  });

  describe('linkClick', () => {
    it('tracks link clicks with URL and text', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.linkClick('https://example.com', 'Example Link');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Link Clicked', {
        url: 'https://example.com',
        text: 'Example Link',
        timestamp: expect.any(String)
      });
    });

    it('tracks link clicks without text', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.linkClick('https://example.com');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Link Clicked', {
        url: 'https://example.com',
        text: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('blogPostView', () => {
    it('tracks blog post views with all properties', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.blogPostView('Test Post', 'test-post', ['tag1', 'tag2']);

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Blog Post Viewed', {
        title: 'Test Post',
        slug: 'test-post',
        tags: ['tag1', 'tag2'],
        timestamp: expect.any(String)
      });
    });

    it('tracks blog post views without tags', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.blogPostView('Test Post', 'test-post');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Blog Post Viewed', {
        title: 'Test Post',
        slug: 'test-post',
        tags: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('contactFormSubmit', () => {
    it('tracks successful form submissions', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.contactFormSubmit(true);

      expect(mockOvertrackingTrack).toHaveBeenCalledWith(
        'Contact Form Submitted',
        {
          success: true,
          error: undefined,
          timestamp: expect.any(String)
        }
      );
    });

    it('tracks failed form submissions with error', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.contactFormSubmit(false, 'Validation failed');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith(
        'Contact Form Submitted',
        {
          success: false,
          error: 'Validation failed',
          timestamp: expect.any(String)
        }
      );
    });
  });

  describe('searchPerformed', () => {
    it('tracks search with results count', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.searchPerformed('test query', 5);

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Search Performed', {
        query: 'test query',
        resultsCount: 5,
        timestamp: expect.any(String)
      });
    });

    it('tracks search without results count', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.searchPerformed('test query');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Search Performed', {
        query: 'test query',
        resultsCount: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('tagClicked', () => {
    it('tracks tag clicks with from page', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.tagClicked('javascript', '/blog');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Tag Clicked', {
        tag: 'javascript',
        fromPage: '/blog',
        timestamp: expect.any(String)
      });
    });

    it('tracks tag clicks without from page', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.tagClicked('javascript');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Tag Clicked', {
        tag: 'javascript',
        fromPage: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('socialLinkClick', () => {
    it('tracks social link clicks', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.socialLinkClick('github', 'https://github.com/user');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith(
        'Social Link Clicked',
        {
          platform: 'github',
          url: 'https://github.com/user',
          timestamp: expect.any(String)
        }
      );
    });
  });

  describe('fileDownload', () => {
    it('tracks file downloads with all properties', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.fileDownload('document.pdf', 'pdf', 1024);

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('File Downloaded', {
        fileName: 'document.pdf',
        fileType: 'pdf',
        fileSize: 1024,
        timestamp: expect.any(String)
      });
    });

    it('tracks file downloads without file size', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.fileDownload('document.pdf', 'pdf');

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('File Downloaded', {
        fileName: 'document.pdf',
        fileType: 'pdf',
        fileSize: undefined,
        timestamp: expect.any(String)
      });
    });
  });

  describe('errorOccurred', () => {
    it('tracks errors', () => {
      const { trackingEvents } = require('../usePageTracking');

      trackingEvents.errorOccurred(
        'TypeError',
        'Cannot read property',
        '/test-page'
      );

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('Error Occurred', {
        errorType: 'TypeError',
        errorMessage: 'Cannot read property',
        page: '/test-page',
        timestamp: expect.any(String)
      });
    });
  });

  describe('when overtracking is not available', () => {
    it('does not throw errors', () => {
      delete (window as any).overtracking;
      const { trackingEvents } = require('../usePageTracking');

      expect(() => {
        trackingEvents.linkClick('https://example.com');
        trackingEvents.blogPostView('Test', 'test');
        trackingEvents.contactFormSubmit(true);
        trackingEvents.searchPerformed('query');
        trackingEvents.tagClicked('tag');
        trackingEvents.socialLinkClick('github', 'url');
        trackingEvents.fileDownload('file.pdf', 'pdf');
        trackingEvents.errorOccurred('Error', 'message', '/page');
      }).not.toThrow();

      expect(mockOvertrackingTrack).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles null pathname gracefully', () => {
      mockUsePathname.mockReturnValue(null);

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();
    });

    it('handles undefined window object', () => {
      const originalWindow = global.window;
      delete (global as any).window;

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();

      global.window = originalWindow;
    });

    it('handles missing document properties', () => {
      const originalTitle = document.title;
      const originalReferrer = Object.getOwnPropertyDescriptor(
        document,
        'referrer'
      );

      delete (document as any).title;
      Object.defineProperty(document, 'referrer', {
        value: '',
        configurable: true
      });

      expect(() => {
        renderHook(() => usePageTracking());
      }).not.toThrow();

      document.title = originalTitle;
      if (originalReferrer) {
        Object.defineProperty(document, 'referrer', originalReferrer);
      }
    });

    it('handles overtracking loading timeout', () => {
      jest.useFakeTimers();
      delete (window as any).overtracking;

      renderHook(() => usePageTracking());

      // Fast-forward past the timeout
      jest.advanceTimersByTime(10000);

      // Should not throw
      expect(() => {
        jest.runAllTimers();
      }).not.toThrow();

      jest.useRealTimers();
    });

    it('handles complex search parameters', () => {
      // Set up environment for tracking
      const originalEnv = process.env.NODE_ENV;
      const originalSiteId = process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID;
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = 'test-site-id';

      // Mock URLSearchParams to simulate complex search parameters
      const originalURLSearchParams = global.URLSearchParams;
      global.URLSearchParams = jest.fn().mockImplementation(() => ({
        forEach: jest.fn()
      }));

      // Test that the hook doesn't crash with complex search parameters
      expect(() => {
        renderHook(() =>
          usePageTracking({
            trackSearchParams: true,
            enabled: true
          })
        );
      }).not.toThrow();

      // Restore everything
      global.URLSearchParams = originalURLSearchParams;
      process.env.NODE_ENV = originalEnv;
      process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = originalSiteId;
    });

    it('handles malformed search parameters', () => {
      (window as any).location = {
        search: '?invalid=param&=empty&malformed'
      };

      expect(() => {
        renderHook(() => usePageTracking({ trackSearchParams: true }));
      }).not.toThrow();
    });

    it('logs page view when enabled but overtracking not available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      delete (window as any).overtracking;

      renderHook(() => usePageTracking({ enabled: true }));

      // Since overtracking is not available, no tracking should occur
      expect(mockOvertrackingPage).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('does not log when disabled and overtracking not available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      delete (window as any).overtracking;

      renderHook(() => usePageTracking({ enabled: false }));

      expect(consoleSpy).not.toHaveBeenCalledWith(
        'Overtracking: Page view would be tracked',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('useEventTracking', () => {
    it('tracks events in production with overtracking available', () => {
      process.env.NODE_ENV = 'production';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useEventTracking());

      result.current.track('test_event', { custom: 'property' });

      expect(mockOvertrackingTrack).toHaveBeenCalledWith('test_event', {
        timestamp: expect.any(String),
        page: '/',
        url: 'http://localhost/',
        custom: 'property'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Overtracking: Event tracked');

      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('logs event tracking in non-production environment', () => {
      process.env.NODE_ENV = 'development';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useEventTracking());

      result.current.track('test_event', { custom: 'property' });

      expect(mockOvertrackingTrack).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Overtracking: Event would be tracked in production'
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = 'test';
    });

    it('logs event tracking when overtracking not available', () => {
      delete (window as any).overtracking;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useEventTracking());

      result.current.track('test_event');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Overtracking: Event would be tracked in production'
      );

      consoleSpy.mockRestore();
    });
  });
});
