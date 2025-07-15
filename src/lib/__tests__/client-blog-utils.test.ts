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
  getFeaturedImage
} from '../client-blog-utils';
import { createMockPost, sharedTestSuites } from './test-utils.helper';

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

  // Use shared test suite for getFeaturedImage
  sharedTestSuites.getFeaturedImage(getFeaturedImage);

  describe('Error Handling', () => {
    it('should handle URL generation errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Create a post that might cause issues
      const problematicPost = createMockPost({
        slug: null as unknown as string
      });

      // The function should handle this gracefully
      const url = getSafePostUrl(problematicPost);
      expect(url).toBe('/blog'); // Should fallback

      consoleSpy.mockRestore();
    });
  });
});
