import { render, screen, waitFor, act } from '@testing-library/react';
import CatLink from '../CatLink';

// Mock the URL sanitizer
jest.mock('@/lib/urlSanitizer', () => ({
  sanitizeCatUrl: jest.fn((url: string) => url)
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('CatLink Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Loading State', () => {
    it('renders as span while loading', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<CatLink>Click for cats!</CatLink>);

      const element = screen.getByText('Click for cats!');
      expect(element.tagName).toBe('SPAN');
      expect(element).not.toHaveAttribute('href');
    });

    it('applies className to loading span', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<CatLink className="custom-class">Loading...</CatLink>);

      const element = screen.getByText('Loading...');
      expect(element).toHaveClass('custom-class');
    });
  });

  describe('Successful API Response', () => {
    it('renders as link when API returns success with URL', async () => {
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      await act(async () => {
        render(<CatLink>Click for cats!</CatLink>);
      });

      await waitFor(() => {
        const element = screen.getByText('Click for cats!');
        expect(element.tagName).toBe('A');
        expect(element).toHaveAttribute('href', 'https://example.com/cat.jpg');
      });
    });

    it('applies proper link attributes', async () => {
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      await act(async () => {
        render(<CatLink>Click for cats!</CatLink>);
      });

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAttribute(
          'title',
          'Click to see a random cat image!'
        );
      });
    });

    it('applies default and custom classes to link', async () => {
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      await act(async () => {
        render(<CatLink className="custom-class">Click for cats!</CatLink>);
      });

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveClass(
          'text-blue-600',
          'dark:text-blue-400',
          'hover:underline',
          'custom-class'
        );
      });
    });
  });

  describe('API Error Handling', () => {
    it('falls back to /api/cat when API returns error', async () => {
      const mockCatData = {
        success: false,
        error: 'No cats found'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/api/cat');
      });
    });

    it('falls back to /api/cat when API returns success but no URL', async () => {
      const mockCatData = {
        success: true
        // No url property
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/api/cat');
      });
    });

    it('falls back to /api/cat when fetch throws error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/api/cat');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch cat URL:',
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('URL Sanitization', () => {
    it('calls sanitizeCatUrl on successful response', async () => {
      const { sanitizeCatUrl } = require('@/lib/urlSanitizer');
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        expect(sanitizeCatUrl).toHaveBeenCalledWith(
          'https://example.com/cat.jpg'
        );
      });
    });

    it('falls back to /api/cat when sanitization returns null', async () => {
      const { sanitizeCatUrl } = require('@/lib/urlSanitizer');
      sanitizeCatUrl.mockReturnValue(null);

      const mockCatData = {
        success: true,
        url: 'javascript:alert("xss")'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/api/cat');
      });
    });

    it('double-checks URL sanitization before rendering', async () => {
      const { sanitizeCatUrl } = require('@/lib/urlSanitizer');
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      await waitFor(() => {
        // Should be called twice: once in useEffect, once before rendering
        expect(sanitizeCatUrl).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('API Integration', () => {
    it('makes correct API call', async () => {
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<CatLink>Click for cats!</CatLink>);

      expect(global.fetch).toHaveBeenCalledWith('/api/cat');
    });
  });

  describe('Children Rendering', () => {
    it('renders children content correctly', async () => {
      const mockCatData = {
        success: true,
        url: 'https://example.com/cat.jpg'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(
        <CatLink>
          <span>Custom content</span>
        </CatLink>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom content')).toBeInTheDocument();
      });
    });
  });
});
