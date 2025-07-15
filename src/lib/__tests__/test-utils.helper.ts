// Shared test utilities for blog-related tests
import { BlogPostMetadata } from '../blog';

export const createMockPost = (
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

// Shared test data for featured images
export const mockPostWithImages: BlogPostMetadata = {
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

// Shared test functions for common functionality
export const sharedTestSuites = {
  // Test suite for parsePostDate function
  parsePostDate: (parsePostDate: (dateString: string) => Date) => {
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
  },

  // Test suite for getTagSlug function
  getTagSlug: (getTagSlug: (tag: string) => string) => {
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
        expect(getTagSlug('Front-end Development')).toBe(
          'front-end-development'
        );
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
  },

  // Test suite for generateWordPressPermalink function
  generateWordPressPermalink: (
    generateWordPressPermalink: (date: string, slug: string) => string
  ) => {
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
  },

  // Test suite for getFeaturedImage function
  getFeaturedImage: (
    getFeaturedImage: (
      post: BlogPostMetadata,
      theme?: 'light' | 'dark'
    ) => string | undefined
  ) => {
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
        expect(getFeaturedImage(mockPostWithImages)).toBe(
          '/images/default.jpg'
        );
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
  }
};
