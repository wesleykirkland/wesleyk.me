import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ThemeAwareFeaturedImage from '../ThemeAwareFeaturedImage';
import type { BlogPostMetadata } from '@/lib/blog';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, className, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-testid="featured-image"
        {...props}
      />
    );
  };
});

describe('ThemeAwareFeaturedImage Component', () => {
  const mockPost: BlogPostMetadata = {
    title: 'Test Post',
    slug: 'test-post',
    date: '2024-01-01',
    excerpt: 'Test excerpt',
    featuredImage: '/images/default.jpg',
    featuredImageLight: '/images/light.jpg',
    featuredImageDark: '/images/dark.jpg',
    tags: ['test'],
    author: 'Test Author',
    readingTime: 5,
    wordCount: 1000
  };

  const mockPostWithoutThemeImages: BlogPostMetadata = {
    title: 'Test Post',
    slug: 'test-post',
    date: '2024-01-01',
    excerpt: 'Test excerpt',
    featuredImage: '/images/default.jpg',
    tags: ['test'],
    author: 'Test Author',
    readingTime: 5,
    wordCount: 1000
  };

  const mockPostWithoutImages: BlogPostMetadata = {
    title: 'Test Post',
    slug: 'test-post',
    date: '2024-01-01',
    excerpt: 'Test excerpt',
    tags: ['test'],
    author: 'Test Author',
    readingTime: 5,
    wordCount: 1000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document class
    document.documentElement.classList.remove('dark');
  });

  describe('Mounting and Hydration', () => {
    it('renders nothing before mounting', () => {
      // Mock useState to return false for mounted state
      const mockUseState = jest.spyOn(React, 'useState');
      mockUseState.mockReturnValueOnce([false, jest.fn()]); // mounted = false
      mockUseState.mockReturnValueOnce(['light', jest.fn()]); // currentTheme = light

      const { container } = render(<ThemeAwareFeaturedImage post={mockPost} />);
      expect(container.firstChild).toBeNull();

      mockUseState.mockRestore();
    });

    it('renders image after mounting', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        expect(screen.getByTestId('featured-image')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Detection', () => {
    it('uses light theme image when no dark class is present', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/light.jpg');
      });
    });

    it('uses dark theme image when dark class is present', async () => {
      document.documentElement.classList.add('dark');

      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/dark.jpg');
      });
    });

    it('falls back to default image when theme-specific images are not available', async () => {
      render(<ThemeAwareFeaturedImage post={mockPostWithoutThemeImages} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/default.jpg');
      });
    });

    it('falls back to default image in dark mode when only light image is available', async () => {
      document.documentElement.classList.add('dark');

      const postWithOnlyLight = {
        ...mockPost,
        featuredImageDark: undefined
      };

      render(<ThemeAwareFeaturedImage post={postWithOnlyLight} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/default.jpg');
      });
    });
  });

  describe('Theme Change Detection', () => {
    it('updates image when theme changes from light to dark', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      // Initially should use light image
      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/light.jpg');
      });

      // Change to dark theme
      document.documentElement.classList.add('dark');

      // Should update to dark image
      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/dark.jpg');
      });
    });

    it('updates image when theme changes from dark to light', async () => {
      document.documentElement.classList.add('dark');

      render(<ThemeAwareFeaturedImage post={mockPost} />);

      // Initially should use dark image
      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/dark.jpg');
      });

      // Change to light theme
      document.documentElement.classList.remove('dark');

      // Should update to light image
      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/light.jpg');
      });
    });
  });

  describe('Image Properties', () => {
    it('applies correct alt text from post title', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('alt', 'Test Post');
      });
    });

    it('applies default className', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveClass('w-full', 'h-auto', 'rounded-lg');
      });
    });

    it('applies custom className', async () => {
      render(
        <ThemeAwareFeaturedImage
          post={mockPost}
          className="custom-class w-1/2"
        />
      );

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveClass('custom-class', 'w-1/2');
      });
    });

    it('wraps image in container with proper margin', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const container = screen.getByTestId('featured-image').parentElement;
        expect(container).toHaveClass('mb-8');
      });
    });
  });

  describe('No Image Handling', () => {
    it('renders nothing when no images are available', async () => {
      const { container } = render(
        <ThemeAwareFeaturedImage post={mockPostWithoutImages} />
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('renders nothing when featuredImage is empty string', async () => {
      const postWithEmptyImage = {
        ...mockPost,
        featuredImage: '',
        featuredImageLight: undefined,
        featuredImageDark: undefined
      };

      const { container } = render(
        <ThemeAwareFeaturedImage post={postWithEmptyImage} />
      );

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('MutationObserver Cleanup', () => {
    it('disconnects observer on unmount', async () => {
      const disconnectSpy = jest.spyOn(
        MutationObserver.prototype,
        'disconnect'
      );

      const { unmount } = render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        expect(screen.getByTestId('featured-image')).toBeInTheDocument();
      });

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
      disconnectSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles post with only dark theme image', async () => {
      const postWithOnlyDark = {
        ...mockPost,
        featuredImageLight: undefined,
        featuredImage: undefined
      };

      document.documentElement.classList.add('dark');

      render(<ThemeAwareFeaturedImage post={postWithOnlyDark} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/dark.jpg');
      });
    });

    it('handles post with only light theme image', async () => {
      const postWithOnlyLight = {
        ...mockPost,
        featuredImageDark: undefined,
        featuredImage: undefined
      };

      render(<ThemeAwareFeaturedImage post={postWithOnlyLight} />);

      await waitFor(() => {
        const image = screen.getByTestId('featured-image');
        expect(image).toHaveAttribute('src', '/images/light.jpg');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful alt text', async () => {
      render(<ThemeAwareFeaturedImage post={mockPost} />);

      await waitFor(() => {
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('alt', 'Test Post');
      });
    });
  });
});
