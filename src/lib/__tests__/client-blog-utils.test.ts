import {
  parsePostDate,
  getSafePostUrl,
  getSafeBlogPostUrl,
  generateWordPressPermalink,
  getPostPermalink,
  getWordPressPermalink,
  getPostUrl,
  isWordPressPermalink,
  getTagSlug,
  getFeaturedImage,
  type BlogPostMetadata
} from '../client-blog-utils';
import { sharedTestSuites } from './test-utils.helper';

// client-blog-utils.ts declares its own BlogPostMetadata (distinct from
// lib/blog.ts's), so mock posts for these tests are built locally rather
// than via the shared test-utils.helper factory.
const createMockPost = (
  overrides: Partial<BlogPostMetadata> = {}
): BlogPostMetadata => ({
  slug: 'test-post',
  title: 'Test Post',
  date: '2024-01-01',
  tags: ['test'],
  excerpt: 'Test excerpt',
  author: 'Test Author',
  ...overrides
});

const mockPostWithImages: BlogPostMetadata = {
  ...createMockPost(),
  date: '2024-03-15',
  featuredImage: '/images/default.jpg',
  featuredImageLight: '/images/light.jpg',
  featuredImageDark: '/images/dark.jpg'
};

describe('Client Blog Utilities', () => {
  // Use shared test suites for common functionality
  sharedTestSuites.parsePostDate(parsePostDate);

  describe('getSafePostUrl', () => {
    it('should generate safe URL for normal slug', () => {
      const post = createMockPost({ slug: 'my-awesome-post' });
      const url = getSafePostUrl(post);
      expect(url).toBe('/my-awesome-post');
    });

    it('should sanitize special characters in slug', () => {
      const post = createMockPost({ slug: 'My Awesome Post!' });
      const url = getSafePostUrl(post);
      expect(url).toBe('/my-awesome-post');
    });

    it('should handle empty slug', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const post = createMockPost({ slug: '' });
      const url = getSafePostUrl(post);
      expect(url).toBe('/blog');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sanitized permalink is empty, using fallback'
      );
      consoleSpy.mockRestore();
    });

    it('should handle slug with only special characters', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Use special characters that don't get converted by sanitize-html
      const post = createMockPost({ slug: '!@#$%^*()' });
      const url = getSafePostUrl(post);
      expect(url).toBe('/blog');

      consoleSpy.mockRestore();
    });
  });

  describe('getSafeBlogPostUrl', () => {
    it('should generate safe URL with blog prefix', () => {
      const post = createMockPost({ slug: 'my-post' });
      const url = getSafeBlogPostUrl(post);
      expect(url).toBe('/blog/my-post');
    });

    it('should handle empty slug with blog prefix', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const post = createMockPost({ slug: '' });
      const url = getSafeBlogPostUrl(post);
      expect(url).toBe('/blog');

      consoleSpy.mockRestore();
    });
  });

  // Use shared test suite for generateWordPressPermalink
  sharedTestSuites.generateWordPressPermalink(generateWordPressPermalink);

  describe('getPostPermalink', () => {
    it('should return post slug as permalink', () => {
      const post = createMockPost({ slug: 'test-post' });
      const permalink = getPostPermalink(post);
      expect(permalink).toBe('test-post');
    });

    it('should throw error for invalid slug', () => {
      const post = createMockPost({ slug: '' });
      expect(() => getPostPermalink(post)).toThrow('Invalid post slug');
    });
  });

  describe('getWordPressPermalink', () => {
    it('should use custom permalink if provided', () => {
      const post = createMockPost({ permalink: 'custom/permalink' });
      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('custom/permalink');
    });

    it('should generate WordPress-style permalink if no custom permalink', () => {
      const post = createMockPost({ date: '2024-01-01', slug: 'test-post' });
      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('2024/01/01/test-post');
    });

    it('should strip leading and trailing slashes from custom permalink', () => {
      const post = createMockPost({ permalink: '/custom/permalink/' });
      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('custom/permalink');
    });
  });

  describe('getPostUrl', () => {
    it('should return post URL with leading slash', () => {
      const post = createMockPost({ slug: 'test-post' });
      const url = getPostUrl(post);
      expect(url).toBe('/test-post');
    });
  });

  describe('isWordPressPermalink', () => {
    it('should identify WordPress permalinks', () => {
      const post = createMockPost({ date: '2024-01-01', slug: 'test-post' });
      const isWP = isWordPressPermalink('2024/01/01/test-post', post);
      expect(isWP).toBe(true);
    });

    it('should return false for modern permalinks', () => {
      const post = createMockPost({ slug: 'test-post' });
      const isWP = isWordPressPermalink('test-post', post);
      expect(isWP).toBe(false);
    });

    it('should handle custom permalinks', () => {
      const post = createMockPost({ permalink: 'custom/path' });
      const isWP = isWordPressPermalink('custom/path', post);
      expect(isWP).toBe(true);
    });
  });

  // Use shared test suite for getTagSlug
  sharedTestSuites.getTagSlug(getTagSlug);

  describe('getFeaturedImage', () => {
    it('should return theme-specific image when available', () => {
      expect(getFeaturedImage(mockPostWithImages, 'light')).toBe(
        '/images/light.jpg'
      );
      expect(getFeaturedImage(mockPostWithImages, 'dark')).toBe(
        '/images/dark.jpg'
      );
    });

    it('should fallback to default image when theme-specific not available', () => {
      const postWithoutThemeImages: BlogPostMetadata = {
        ...mockPostWithImages,
        featuredImageLight: undefined,
        featuredImageDark: undefined
      };

      expect(getFeaturedImage(postWithoutThemeImages, 'light')).toBe(
        '/images/default.jpg'
      );
      expect(getFeaturedImage(postWithoutThemeImages, 'dark')).toBe(
        '/images/default.jpg'
      );
    });

    it('should return default image when no theme specified', () => {
      expect(getFeaturedImage(mockPostWithImages)).toBe('/images/default.jpg');
    });

    it('should return undefined when no images available', () => {
      const postWithoutImages: BlogPostMetadata = {
        ...mockPostWithImages,
        featuredImage: undefined,
        featuredImageLight: undefined,
        featuredImageDark: undefined
      };

      expect(getFeaturedImage(postWithoutImages, 'light')).toBeUndefined();
      expect(getFeaturedImage(postWithoutImages, 'dark')).toBeUndefined();
      expect(getFeaturedImage(postWithoutImages)).toBeUndefined();
    });

    it('should handle partial theme image availability', () => {
      const postWithOnlyDark: BlogPostMetadata = {
        ...mockPostWithImages,
        featuredImageLight: undefined
      };

      expect(getFeaturedImage(postWithOnlyDark, 'light')).toBe(
        '/images/default.jpg'
      );
      expect(getFeaturedImage(postWithOnlyDark, 'dark')).toBe(
        '/images/dark.jpg'
      );

      const postWithOnlyLight: BlogPostMetadata = {
        ...mockPostWithImages,
        featuredImageDark: undefined
      };

      expect(getFeaturedImage(postWithOnlyLight, 'light')).toBe(
        '/images/light.jpg'
      );
      expect(getFeaturedImage(postWithOnlyLight, 'dark')).toBe(
        '/images/default.jpg'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle URL generation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Create a post that might cause issues
      const problematicPost = createMockPost({ slug: null as any });

      // The function should handle this gracefully
      const url = getSafePostUrl(problematicPost);
      expect(url).toBe('/blog'); // Should fallback

      consoleSpy.mockRestore();
    });
  });
});
