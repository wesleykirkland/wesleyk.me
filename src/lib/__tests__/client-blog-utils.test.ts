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

describe('Client Blog Utilities', () => {
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

  describe('parsePostDate', () => {
    it('should parse YYYY-MM-DD format correctly', () => {
      const date = parsePostDate('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // 0-indexed
      expect(date.getDate()).toBe(15);
    });

    it('should handle other date formats', () => {
      const date = parsePostDate('2024-12-25T10:30:00Z');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2024);
    });

    it('should handle edge cases', () => {
      const date1 = parsePostDate('2024-02-29'); // Leap year
      expect(date1.getFullYear()).toBe(2024);
      expect(date1.getMonth()).toBe(1);
      expect(date1.getDate()).toBe(29);

      const date2 = parsePostDate('2024-12-31');
      expect(date2.getFullYear()).toBe(2024);
      expect(date2.getMonth()).toBe(11);
      expect(date2.getDate()).toBe(31);
    });
  });

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

      const post = createMockPost({ slug: '!@#$%^&*()' });
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

  describe('generateWordPressPermalink', () => {
    it('should generate correct WordPress-style permalinks', () => {
      expect(generateWordPressPermalink('2024-03-15', 'my-post')).toBe(
        '2024/03/15/my-post'
      );
      expect(generateWordPressPermalink('2024-01-05', 'another-post')).toBe(
        '2024/01/05/another-post'
      );
    });

    it('should pad single digit months and days', () => {
      expect(generateWordPressPermalink('2024-01-01', 'new-year')).toBe(
        '2024/01/01/new-year'
      );
      expect(generateWordPressPermalink('2024-09-05', 'september-post')).toBe(
        '2024/09/05/september-post'
      );
    });

    it('should handle different date formats', () => {
      expect(generateWordPressPermalink('2024-12-31', 'year-end-post')).toBe(
        '2024/12/31/year-end-post'
      );
    });
  });

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

  describe('getTagSlug', () => {
    it('should convert tags to URL-safe slugs', () => {
      expect(getTagSlug('JavaScript')).toBe('javascript');
      expect(getTagSlug('Case Study')).toBe('case-study');
      expect(getTagSlug('Node.js')).toBe('node-js');
      expect(getTagSlug('C++')).toBe('c');
      expect(getTagSlug('React/Next.js')).toBe('react-next-js');
    });

    it('should handle special characters', () => {
      expect(getTagSlug('C#')).toBe('c');
      expect(getTagSlug('Vue.js 3.0')).toBe('vue-js-3-0');
      expect(getTagSlug('API & REST')).toBe('api-rest');
      expect(getTagSlug('Front-end Development')).toBe('front-end-development');
    });

    it('should handle edge cases', () => {
      expect(getTagSlug('')).toBe('');
      expect(getTagSlug('   ')).toBe('');
      expect(getTagSlug('123')).toBe('123');
      expect(getTagSlug('---')).toBe('');
      expect(getTagSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('should handle unicode characters', () => {
      expect(getTagSlug('JavaScript 中文')).toBe('javascript');
      expect(getTagSlug('Café')).toBe('caf');
      expect(getTagSlug('naïve')).toBe('na-ve');
    });
  });

  describe('getFeaturedImage', () => {
    const mockPost: BlogPostMetadata = {
      slug: 'test-post',
      title: 'Test Post',
      date: '2024-03-15',
      excerpt: 'Test excerpt',
      tags: ['test'],
      author: 'Test Author',
      featuredImage: '/images/default.jpg',
      featuredImageLight: '/images/light.jpg',
      featuredImageDark: '/images/dark.jpg'
    };

    it('should return theme-specific image when available', () => {
      expect(getFeaturedImage(mockPost, 'light')).toBe('/images/light.jpg');
      expect(getFeaturedImage(mockPost, 'dark')).toBe('/images/dark.jpg');
    });

    it('should fallback to default image when theme-specific not available', () => {
      const postWithoutThemeImages: BlogPostMetadata = {
        ...mockPost,
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
      expect(getFeaturedImage(mockPost)).toBe('/images/default.jpg');
    });

    it('should return undefined when no images available', () => {
      const postWithoutImages: BlogPostMetadata = {
        ...mockPost,
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
        ...mockPost,
        featuredImageLight: undefined
      };

      expect(getFeaturedImage(postWithOnlyDark, 'light')).toBe(
        '/images/default.jpg'
      );
      expect(getFeaturedImage(postWithOnlyDark, 'dark')).toBe(
        '/images/dark.jpg'
      );

      const postWithOnlyLight: BlogPostMetadata = {
        ...mockPost,
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
