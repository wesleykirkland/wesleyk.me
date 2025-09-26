import { render, renderHook } from '@testing-library/react';
import Overtracking, { useOvertracking } from '../Overtracking';

// Store references to callbacks for testing
let mockOnLoad: (() => void) | undefined;
let mockOnError: ((e: Error) => void) | undefined;

// Mock Next.js Script component
jest.mock('next/script', () => {
  return function MockScript({
    src,
    onLoad,
    onError,
    ...props
  }: {
    src: string;
    onLoad?: () => void;
    onError?: (e: Error) => void;
    [key: string]: unknown;
  }) {
    // Store callbacks for testing
    mockOnLoad = onLoad;
    mockOnError = onError;

    return (
      <div
        data-src={src}
        src={src}
        data-onload={onLoad ? 'true' : 'false'}
        data-onerror={onError ? 'true' : 'false'}
        data-testid="overtracking-script"
        {...props}
      />
    );
  };
});

describe('Overtracking Component', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders script when site ID is provided and enabled', () => {
    process.env.NODE_ENV = 'production';

    const { getByTestId } = render(
      <Overtracking siteId="test-site-id" enabled={true} />
    );

    const script = getByTestId('overtracking-script');
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute(
      'data-src',
      'https://cdn.overtracking.com/t/test-site-id/'
    );
  });

  it('does not render when site ID is missing', () => {
    const { queryByTestId } = render(<Overtracking siteId="" enabled={true} />);

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });

  it('does not render when disabled', () => {
    const { queryByTestId } = render(
      <Overtracking siteId="test-site-id" enabled={false} />
    );

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });

  it('uses environment variable for site ID by default', () => {
    process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = 'env-site-id';
    process.env.NODE_ENV = 'production';

    const { getByTestId } = render(<Overtracking />);

    const script = getByTestId('overtracking-script');
    expect(script).toHaveAttribute(
      'data-src',
      'https://cdn.overtracking.com/t/env-site-id/'
    );
  });

  it('defaults to production-only when no enabled prop provided', () => {
    process.env.NODE_ENV = 'development';

    const { queryByTestId } = render(<Overtracking siteId="test-site-id" />);

    expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
  });

  describe('Site ID Handling', () => {
    it('renders script with any provided site ID (no validation)', () => {
      const testSiteIds = [
        'valid-site-123',
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '../../../etc/passwd',
        'site id with spaces',
        'site/with/slashes'
      ];

      testSiteIds.forEach((siteId, index) => {
        const { container } = render(
          <div key={`test-${index}`}>
            <Overtracking siteId={siteId} enabled={true} />
          </div>
        );
        const scriptElement = container.querySelector(
          '#overtracking-analytics'
        );
        expect(scriptElement).toBeInTheDocument();
        expect(scriptElement?.getAttribute('src')).toBe(
          `https://cdn.overtracking.com/t/${siteId}/`
        );
      });
    });

    it('handles valid alphanumeric site IDs', () => {
      const validSiteIds = ['abc123', 'site-id-123', 'VALID-ID'];

      validSiteIds.forEach((siteId, index) => {
        const { container } = render(
          <div key={`valid-${index}`}>
            <Overtracking siteId={siteId} enabled={true} />
          </div>
        );
        const scriptElement = container.querySelector(
          '#overtracking-analytics'
        );
        expect(scriptElement).toBeInTheDocument();
        expect(scriptElement?.getAttribute('src')).toBe(
          `https://cdn.overtracking.com/t/${siteId}/`
        );
      });
    });
  });

  describe('Environment Handling', () => {
    it('works in production environment', () => {
      process.env.NODE_ENV = 'production';

      const { getByTestId } = render(
        <Overtracking siteId="test-site-id" enabled={true} />
      );

      expect(getByTestId('overtracking-script')).toBeInTheDocument();
    });

    it('does not render in test environment by default', () => {
      process.env.NODE_ENV = 'test';

      const { queryByTestId } = render(<Overtracking siteId="test-site-id" />);

      expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
    });

    it('does not render when disabled', () => {
      const { queryByTestId } = render(
        <Overtracking siteId="test-site" enabled={false} />
      );

      expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();
    });

    it('does not render when no site ID is provided', () => {
      // Clear environment variable to ensure no default site ID
      const originalSiteId = process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID;
      delete process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID;

      const { queryByTestId } = render(<Overtracking enabled={true} />);

      expect(queryByTestId('overtracking-script')).not.toBeInTheDocument();

      // Restore environment variable
      if (originalSiteId) {
        process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID = originalSiteId;
      }
    });
  });

  describe('Script Event Handlers', () => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    beforeEach(() => {
      console.log = jest.fn();
      console.error = jest.fn();
      mockOnLoad = undefined;
      mockOnError = undefined;
    });

    afterEach(() => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    });

    it('calls onError handler when script fails to load', () => {
      render(<Overtracking siteId="test-site" enabled={true} />);

      // Verify the onError callback was set
      expect(mockOnError).toBeDefined();

      // Call the onError callback to test the function
      if (mockOnError) {
        const testError = new Error('Script failed to load');
        mockOnError(testError);
        expect(console.error).toHaveBeenCalledWith(
          'Overtracking: Failed to load script',
          testError
        );
      }
    });
  });
});

describe('useOvertracking Hook', () => {
  const originalConsoleLog = console.log;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    console.log = jest.fn();
    // Clear any existing window.overtracking
    delete (window as any).overtracking;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('in development environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('logs development messages for track', () => {
      const { result } = renderHook(() => useOvertracking());

      result.current.track('test-event', { prop: 'value' });

      expect(console.log).toHaveBeenCalledWith(
        'Overtracking: Event would be tracked in production'
      );
    });

    it('logs development messages for identify', () => {
      const { result } = renderHook(() => useOvertracking());

      result.current.identify('user123', { name: 'Test User' });

      expect(console.log).toHaveBeenCalledWith(
        'Overtracking: User would be identified in production'
      );
    });

    it('logs development messages for page', () => {
      const { result } = renderHook(() => useOvertracking());

      result.current.page('Home', { title: 'Home Page' });

      expect(console.log).toHaveBeenCalledWith(
        'Overtracking: Page would be tracked in production'
      );
    });
  });

  describe('in production environment', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('calls overtracking.track when available', () => {
      const mockTrack = jest.fn();
      (window as any).overtracking = { track: mockTrack };

      const { result } = renderHook(() => useOvertracking());

      result.current.track('test-event', { prop: 'value' });

      expect(mockTrack).toHaveBeenCalledWith('test-event', { prop: 'value' });
      expect(console.log).toHaveBeenCalledWith('Overtracking: Event tracked');
    });

    it('calls overtracking.identify when available', () => {
      const mockIdentify = jest.fn();
      (window as any).overtracking = { identify: mockIdentify };

      const { result } = renderHook(() => useOvertracking());

      result.current.identify('user123', { name: 'Test User' });

      expect(mockIdentify).toHaveBeenCalledWith('user123', {
        name: 'Test User'
      });
      expect(console.log).toHaveBeenCalledWith('Overtracking: User identified');
    });

    it('calls overtracking.page when available', () => {
      const mockPage = jest.fn();
      (window as any).overtracking = { page: mockPage };

      const { result } = renderHook(() => useOvertracking());

      result.current.page('Home', { title: 'Home Page' });

      expect(mockPage).toHaveBeenCalledWith('Home', { title: 'Home Page' });
      expect(console.log).toHaveBeenCalledWith('Overtracking: Page tracked');
    });

    it('handles missing overtracking object gracefully', () => {
      const { result } = renderHook(() => useOvertracking());

      // Should not throw when overtracking is not available
      expect(() => {
        result.current.track('test-event');
        result.current.identify('user123');
        result.current.page('Home');
      }).not.toThrow();
    });

    it('handles optional parameters', () => {
      const mockTrack = jest.fn();
      const mockIdentify = jest.fn();
      const mockPage = jest.fn();
      (window as any).overtracking = {
        track: mockTrack,
        identify: mockIdentify,
        page: mockPage
      };

      const { result } = renderHook(() => useOvertracking());

      result.current.track('event-without-props');
      result.current.identify('user-without-traits');
      result.current.page();

      expect(mockTrack).toHaveBeenCalledWith('event-without-props', undefined);
      expect(mockIdentify).toHaveBeenCalledWith(
        'user-without-traits',
        undefined
      );
      expect(mockPage).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
