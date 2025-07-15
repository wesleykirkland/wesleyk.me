import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import RandomCat from '../RandomCat';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, className, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="cat-image"
        {...props}
      />
    );
  };
});

// Mock the URL sanitizer
jest.mock('@/lib/urlSanitizer', () => ({
  sanitizeCatUrl: jest.fn((url: string) => url)
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('RandomCat Component', () => {
  const mockCatData = {
    success: true,
    image: '/api/cat/serve/cat1.jpg',
    filename: 'cat1.jpg',
    url: '/api/cat/serve/cat1.jpg',
    timestamp: '2024-01-01T12:00:00Z',
    fileSize: 1024000,
    lastModified: '2024-01-01T10:00:00Z',
    totalCats: 5
  };

  const mockErrorData = {
    success: false,
    error: 'No cat images found'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Loading', () => {
    it('shows loading state initially', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<RandomCat />);

      expect(screen.getByText('Loading cat...')).toBeInTheDocument();
      expect(screen.getByText('🐱')).toBeInTheDocument();
    });

    it('fetches cat data on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      await act(async () => {
        render(<RandomCat />);
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/cat');
    });
  });

  describe('Successful Cat Display', () => {
    it('displays cat image when data is loaded', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByTestId('cat-image')).toBeInTheDocument();
        expect(screen.getByTestId('cat-image')).toHaveAttribute(
          'src',
          '/api/cat/serve/cat1.jpg'
        );
        expect(screen.getByTestId('cat-image')).toHaveAttribute(
          'alt',
          'Random cat: cat1.jpg'
        );
      });
    });

    it('shows component title and new cat button', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByText('🐱 Random Cat')).toBeInTheDocument();
        expect(screen.getByText('New Cat')).toBeInTheDocument();
      });
    });

    it('applies custom className', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      const { container } = render(<RandomCat className="custom-class" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('custom-class');
      });
    });
  });

  describe('Info Display', () => {
    it('shows additional info when showInfo is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Filename:')).toBeInTheDocument();
        expect(screen.getByText('cat1.jpg')).toBeInTheDocument();
        expect(screen.getByText('Total Cats:')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('File Size:')).toBeInTheDocument();
        expect(screen.getByText('1000 KB')).toBeInTheDocument();
      });
    });

    it('does not show info when showInfo is false', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Filename:')).not.toBeInTheDocument();
        expect(screen.queryByText('Total Cats:')).not.toBeInTheDocument();
      });
    });

    it('fetches with info parameter when showInfo is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      expect(global.fetch).toHaveBeenCalledWith('/api/cat?info=true');
    });

    it('shows direct URL link when info is displayed', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/api/cat/serve/cat1.jpg');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when API returns error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockErrorData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByText('No Cats Found')).toBeInTheDocument();
        expect(screen.getByText('No cat images found')).toBeInTheDocument();
        expect(screen.getByText('😿')).toBeInTheDocument();
      });
    });

    it('displays network error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<RandomCat />);

      await waitFor(() => {
        expect(
          screen.getByText('Network error: Failed to fetch cat image')
        ).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('shows try again button in error state', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockErrorData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('shows helpful instructions in error state', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockErrorData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByText('To fix this:')).toBeInTheDocument();
        expect(screen.getByText(/Add cat images to the/)).toBeInTheDocument();
        expect(screen.getByText('/public/cats')).toBeInTheDocument();
      });
    });
  });

  describe('New Cat Button', () => {
    it('fetches new cat when button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByText('New Cat')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('New Cat'));

      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + button click
    });

    it('disables button while loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<RandomCat />);

      const button = screen.getByRole('button', { name: /Loading/ });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Loading...');
    });

    it('shows loading overlay when fetching new cat', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat />);

      await waitFor(() => {
        expect(screen.getByTestId('cat-image')).toBeInTheDocument();
      });

      // Mock a slow response for the second call
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );

      fireEvent.click(screen.getByText('New Cat'));

      expect(screen.getByText('Loading new cat...')).toBeInTheDocument();
    });
  });

  describe('Auto Refresh', () => {
    it('sets up auto refresh interval when autoRefresh prop is provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat autoRefresh={5} />);

      await waitFor(() => {
        expect(
          screen.getByText('Auto-refreshing every 5 seconds')
        ).toBeInTheDocument();
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + auto refresh
    });

    it('does not set up auto refresh when autoRefresh is 0', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat autoRefresh={0} />);

      await waitFor(() => {
        expect(screen.queryByText(/Auto-refreshing/)).not.toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('cleans up interval on unmount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      const { unmount } = render(<RandomCat autoRefresh={5} />);

      unmount();

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial call
    });
  });

  describe('Utility Functions', () => {
    it('formats file sizes correctly', async () => {
      const largeFileData = {
        ...mockCatData,
        fileSize: 2097152 // Exactly 2MB in bytes
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(largeFileData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('2 MB')).toBeInTheDocument();
      });
    });

    it('formats dates correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Last Modified:')).toBeInTheDocument();
        // Date formatting will depend on locale, so just check it exists
        expect(screen.getByText(/2024/)).toBeInTheDocument();
      });
    });
  });

  describe('URL Sanitization', () => {
    it('sanitizes URLs before displaying', async () => {
      const { sanitizeCatUrl } = require('@/lib/urlSanitizer');

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        expect(sanitizeCatUrl).toHaveBeenCalledWith('/api/cat/serve/cat1.jpg');
      });
    });

    it('shows invalid URL message when sanitization fails', async () => {
      const { sanitizeCatUrl } = require('@/lib/urlSanitizer');
      sanitizeCatUrl.mockReturnValue(null);

      (global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockCatData)
      });

      render(<RandomCat showInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Invalid URL')).toBeInTheDocument();
      });
    });
  });
});
