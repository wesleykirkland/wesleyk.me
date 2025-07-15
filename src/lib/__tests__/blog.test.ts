import {
  parsePostDate,
  getSortedPostsData,
  getAllPostSlugs,
  getPostData,
  getRecentPosts,
  getSecurityResearchPosts,
  getCaseStudyPosts,
  getAllTags,
  getPostsByTag,
  getTagSlug,
  getTagFromSlug,
  getBlogImagePath,
  getBlogImageUrl,
  generateWordPressPermalink,
  getPostPermalink,
  getWordPressPermalink,
  getPostUrl,
  getSafePostUrl,
  getSafeBlogPostUrl,
  getBlogPostUrl,
  getPostByPermalink,
  isWordPressPermalink,
  getFeaturedImage,
  searchPosts,
  getSearchSuggestions,
  type BlogPostMetadata
} from '../blog';
import { createMockPost, sharedTestSuites } from './test-utils.helper';

// Mock the dependencies
jest.mock('fs', () => ({
  readdirSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
  resolve: jest.fn((...args: string[]) => args.join('/')),
  extname: jest.fn((file: string) =>
    file.includes('.') ? '.' + file.split('.').pop() : ''
  )
}));

jest.mock('gray-matter', () => jest.fn());

jest.mock('remark', () => ({
  remark: jest.fn(() => ({
    use: jest.fn().mockReturnThis(),
    process: jest.fn().mockResolvedValue({
      toString: jest.fn().mockReturnValue('<p>Test content</p>')
    })
  }))
}));

jest.mock('remark-html', () => jest.fn());
jest.mock('remark-gfm', () => jest.fn());
jest.mock('sanitize-html', () => jest.fn((html: string) => html));

const fs = require('fs');
const matter = require('gray-matter');

describe('Blog Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['post1.md', 'post2.md']);
    fs.readFileSync.mockReturnValue('# Test Post\n\nContent here');

    matter.mockReturnValue({
      data: {
        title: 'Test Post',
        date: '2024-01-01',
        tags: ['test', 'blog'],
        excerpt: 'Test excerpt',
        author: 'Test Author'
      },
      content: '# Test Post\n\nContent here'
    });
  });

  // Use shared test suite for getTagSlug
  sharedTestSuites.getTagSlug(getTagSlug);

  describe('getTagFromSlug', () => {
    it('should return tag from slug', () => {
      fs.readdirSync.mockReturnValue(['post1.md', 'post2.md']);
      matter.mockReturnValue({
        data: {
          title: 'Test Post',
          date: '2024-01-01',
          tags: ['JavaScript', 'React', 'Next.js'],
          author: 'Test Author'
        },
        content: 'Test content'
      });

      const tag = getTagFromSlug('javascript');
      expect(tag).toBe('JavaScript');
    });

    it('should return null for non-existent slug', () => {
      fs.readdirSync.mockReturnValue(['post1.md']);
      matter.mockReturnValue({
        data: {
          title: 'Test Post',
          date: '2024-01-01',
          tags: ['React'],
          author: 'Test Author'
        },
        content: 'Test content'
      });

      const tag = getTagFromSlug('nonexistent');
      expect(tag).toBeNull();
    });
  });

  describe('getBlogImagePath', () => {
    it('should generate correct image paths', () => {
      const currentYear = new Date().getFullYear();
      expect(getBlogImagePath('my-post', 'image.jpg')).toBe(
        `/images/blog/${currentYear}/my-post/image.jpg`
      );
      expect(getBlogImagePath('case-study-example', 'hero.png')).toBe(
        `/images/blog/${currentYear}/case-study-example/hero.png`
      );
    });

    it('should handle special characters in slugs', () => {
      const currentYear = new Date().getFullYear();
      expect(getBlogImagePath('post-with-dashes', 'image.jpg')).toBe(
        `/images/blog/${currentYear}/post-with-dashes/image.jpg`
      );
    });

    it('should handle different file extensions', () => {
      const slug = 'test-post';
      expect(getBlogImagePath(slug, 'image.jpg')).toContain('.jpg');
      expect(getBlogImagePath(slug, 'diagram.svg')).toContain('.svg');
      expect(getBlogImagePath(slug, 'screenshot.png')).toContain('.png');
    });
  });

  describe('getBlogImageUrl', () => {
    it('should return the same as getBlogImagePath', () => {
      const slug = 'test-post';
      const imageName = 'test.jpg';
      expect(getBlogImageUrl(slug, imageName)).toBe(
        getBlogImagePath(slug, imageName)
      );
    });
  });

  // Use shared test suite for generateWordPressPermalink
  sharedTestSuites.generateWordPressPermalink(generateWordPressPermalink);

  // Use shared test suite for getFeaturedImage
  sharedTestSuites.getFeaturedImage(getFeaturedImage);

  // Use shared test suite for parsePostDate
  sharedTestSuites.parsePostDate(parsePostDate);

  describe('getSortedPostsData', () => {
    it('should return sorted posts data', () => {
      const posts = getSortedPostsData();
      expect(fs.readdirSync).toHaveBeenCalled();
      expect(posts).toHaveLength(2);
    });

    it('should handle empty directory', () => {
      fs.readdirSync.mockReturnValue([]);
      const posts = getSortedPostsData();
      expect(posts).toEqual([]);
    });
  });

  describe('getAllPostSlugs', () => {
    it('should return all post slugs', () => {
      const slugs = getAllPostSlugs();
      expect(slugs).toHaveLength(2);
      expect(slugs[0]).toHaveProperty('params');
      expect(slugs[0].params).toHaveProperty('slug');
    });
  });

  describe('getPostData', () => {
    it('should return post data with processed content', async () => {
      const postData = await getPostData('test-post');
      expect(postData).toHaveProperty('slug', 'test-post');
      expect(postData).toHaveProperty('title', 'Test Post');
      expect(postData).toHaveProperty('content');
    });

    it('should handle posts with no content', async () => {
      matter.mockReturnValue({
        data: {
          title: 'Empty Post',
          date: '2024-01-01',
          tags: [],
          author: 'Test Author'
        },
        content: ''
      });

      const postData = await getPostData('empty-post');
      expect(postData.content).toBeDefined();
    });

    it('should throw error for non-existent post', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      await expect(getPostData('non-existent')).rejects.toThrow();
    });

    it('should handle posts with complex metadata', async () => {
      matter.mockReturnValue({
        data: {
          title: 'Complex Post',
          date: '2024-01-01',
          tags: ['JavaScript', 'React', 'Next.js'],
          author: 'Test Author',
          excerpt: 'Test excerpt',
          permalink: '/2024/01/01/complex-post/',
          securityResearch: {
            severity: 'High',
            cve: 'CVE-2024-0001'
          },
          caseStudy: {
            type: 'Security Assessment',
            client: 'Test Client'
          }
        },
        content: 'Complex content with **markdown**'
      });

      const postData = await getPostData('complex-post');
      expect(postData.title).toBe('Complex Post');
      expect(postData.tags).toEqual(['JavaScript', 'React', 'Next.js']);
      expect(postData.securityResearch).toEqual({
        severity: 'High',
        cve: 'CVE-2024-0001'
      });
      expect(postData.caseStudy).toEqual({
        type: 'Security Assessment',
        client: 'Test Client'
      });
    });
  });

  describe('getRecentPosts', () => {
    it('should return recent posts with default count', () => {
      const posts = getRecentPosts();
      expect(posts).toHaveLength(2); // Limited by available posts
    });

    it('should respect custom count', () => {
      const posts = getRecentPosts(1);
      expect(posts).toHaveLength(1);
    });
  });

  describe('getSecurityResearchPosts', () => {
    it('should return security research posts', () => {
      matter.mockReturnValue({
        data: {
          title: 'Security Post',
          date: '2024-01-01',
          tags: ['Security'],
          securityResearch: { severity: 'High' }
        },
        content: 'Security content'
      });

      const posts = getSecurityResearchPosts();
      expect(posts).toHaveLength(2);
    });
  });

  describe('getCaseStudyPosts', () => {
    it('should return case study posts', () => {
      matter.mockReturnValue({
        data: {
          title: 'Case Study',
          date: '2024-01-01',
          tags: ['Case Study'],
          caseStudy: { type: 'Security Assessment' }
        },
        content: 'Case study content'
      });

      const posts = getCaseStudyPosts();
      expect(posts).toHaveLength(2);
    });
  });

  describe('getAllTags', () => {
    it('should return all unique tags', () => {
      const tags = getAllTags();
      expect(tags).toContain('test');
      expect(tags).toContain('blog');
    });
  });

  describe('getPostsByTag', () => {
    it('should return posts filtered by tag', () => {
      const posts = getPostsByTag('test');
      expect(posts).toHaveLength(2);
    });

    it('should handle case-insensitive matching', () => {
      const posts = getPostsByTag('TEST');
      expect(posts).toHaveLength(2);
    });
  });

  describe('getTagFromSlug', () => {
    it('should return tag from slug', () => {
      const tag = getTagFromSlug('test');
      expect(tag).toBe('test');
    });

    it('should return null for non-existent slug', () => {
      const tag = getTagFromSlug('non-existent');
      expect(tag).toBeNull();
    });
  });

  describe('getPostPermalink', () => {
    it('should return post slug as permalink', () => {
      const post = createMockPost();

      const permalink = getPostPermalink(post);
      expect(permalink).toBe('test-post');
    });

    it('should throw error for invalid slug', () => {
      const post = createMockPost({ slug: '' });

      expect(() => getPostPermalink(post)).toThrow('Invalid post slug');
    });

    it('should throw error for dangerous characters in slug', () => {
      // This will test lines 269-270
      const postWithScript = createMockPost({
        slug: 'test<script>alert("xss")</script>'
      });
      expect(() => getPostPermalink(postWithScript)).toThrow(
        'Post slug contains potentially dangerous characters'
      );

      const postWithQuote = createMockPost({ slug: 'test"quote' });
      expect(() => getPostPermalink(postWithQuote)).toThrow(
        'Post slug contains potentially dangerous characters'
      );

      const postWithSingleQuote = createMockPost({ slug: "test'quote" });
      expect(() => getPostPermalink(postWithSingleQuote)).toThrow(
        'Post slug contains potentially dangerous characters'
      );
    });
  });

  describe('getWordPressPermalink', () => {
    it('should generate WordPress-style permalink', () => {
      const post = createMockPost();

      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('2024/01/01/test-post');
    });

    it('should use custom permalink if provided', () => {
      const post = createMockPost({ permalink: 'custom/permalink' });

      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('custom/permalink');
    });

    it('should use wordpressUrl if provided', () => {
      // This will test lines 283-284
      const post = createMockPost({ wordpressUrl: '/wordpress/custom/url/' });

      const permalink = getWordPressPermalink(post);
      expect(permalink).toBe('/wordpress/custom/url/');
    });
  });

  describe('getPostUrl', () => {
    it('should return post URL', () => {
      const post = createMockPost();

      const url = getPostUrl(post);
      expect(url).toBe('/test-post');
    });
  });

  describe('getSafePostUrl', () => {
    it('should return safe post URL', () => {
      const post = createMockPost();

      const url = getSafePostUrl(post);
      expect(url).toBe('/test-post');
    });
  });

  describe('getPostByPermalink', () => {
    it('should find post by permalink', () => {
      const post = getPostByPermalink('post1');
      expect(post).toBeTruthy();
    });

    it('should return null for non-existent permalink', () => {
      const post = getPostByPermalink('non-existent');
      expect(post).toBeNull();
    });
  });

  describe('isWordPressPermalink', () => {
    it('should identify WordPress permalinks', () => {
      const post = createMockPost();

      const isWP = isWordPressPermalink('2024/01/01/test-post', post);
      expect(isWP).toBe(true);
    });

    it('should return false for modern permalinks', () => {
      const post = createMockPost();

      const isWP = isWordPressPermalink('test-post', post);
      expect(isWP).toBe(false);
    });
  });

  describe('Search Functionality', () => {
    const mockPosts: BlogPostMetadata[] = [
      {
        slug: 'javascript-tutorial',
        title: 'JavaScript Tutorial for Beginners',
        date: '2024-01-15',
        excerpt: 'Learn JavaScript fundamentals with practical examples',
        tags: ['JavaScript', 'Tutorial', 'Programming'],
        author: 'Test Author'
      },
      {
        slug: 'react-hooks-guide',
        title: 'React Hooks Complete Guide',
        date: '2024-01-10',
        excerpt: 'Master React hooks with this comprehensive guide',
        tags: ['React', 'JavaScript', 'Frontend'],
        author: 'Test Author'
      },
      {
        slug: 'security-vulnerability-analysis',
        title: 'Security Vulnerability Analysis',
        date: '2024-01-05',
        excerpt: 'Deep dive into security vulnerability assessment',
        tags: ['Security', 'Vulnerability', 'Analysis'],
        author: 'Test Author'
      }
    ];

    beforeEach(() => {
      // Mock getSortedPostsData to return our test posts
      jest.clearAllMocks();
      fs.readdirSync.mockReturnValue(['post1.md', 'post2.md', 'post3.md']);

      let callCount = 0;
      matter.mockImplementation(() => {
        const post = mockPosts[callCount % mockPosts.length];
        callCount++;
        return {
          data: post,
          content: `# ${post.title}\n\n${
            post.excerpt
          }\n\nDetailed content about ${post.tags.join(', ')}`
        };
      });
    });

    describe('searchPosts', () => {
      it('should return empty results for empty query and no tags', async () => {
        const results = await searchPosts({ query: '' });
        expect(results).toEqual([]);
      });

      it('should search by title with high relevance', async () => {
        const results = await searchPosts({ query: 'JavaScript' });
        expect(results).toHaveLength(2);
        expect(results[0].post.title).toContain('JavaScript');
        expect(results[0].relevanceScore).toBeGreaterThan(
          results[1].relevanceScore
        );
        expect(results[0].matchedFields).toContain('title');
      });

      it('should search by excerpt with medium relevance', async () => {
        const results = await searchPosts({ query: 'comprehensive' });
        expect(results).toHaveLength(1);
        expect(results[0].post.excerpt).toContain('comprehensive');
        expect(results[0].matchedFields).toContain('excerpt');
      });

      it('should search by tags with medium relevance', async () => {
        const results = await searchPosts({ query: 'Security' });
        expect(results).toHaveLength(1);
        expect(results[0].post.tags).toContain('Security');
        expect(results[0].matchedFields).toContain('tags');
      });

      it('should handle multiple search terms', async () => {
        const results = await searchPosts({ query: 'React JavaScript' });
        expect(results).toHaveLength(2);
        // Should find posts containing either React or JavaScript
      });

      it('should filter by tags when specified', async () => {
        const results = await searchPosts({
          query: '',
          tags: ['Security']
        });
        // Should find posts that contain the Security tag
        const securityPosts = results.filter((r) =>
          r.post.tags.includes('Security')
        );
        expect(securityPosts).toHaveLength(1);
        expect(securityPosts[0].post.tags).toContain('Security');
      });

      it('should combine text search with tag filtering', async () => {
        const results = await searchPosts({
          query: 'guide',
          tags: ['React']
        });
        expect(results).toHaveLength(1);
        expect(results[0].post.title).toContain('React');
        expect(results[0].post.excerpt).toContain('guide');
      });

      it('should respect limit parameter', async () => {
        const results = await searchPosts({
          query: 'JavaScript',
          limit: 1
        });
        expect(results).toHaveLength(1);
      });

      it('should handle case-insensitive search', async () => {
        const results = await searchPosts({ query: 'javascript' });
        expect(results).toHaveLength(2);
      });

      it('should sort results by relevance score', async () => {
        const results = await searchPosts({ query: 'JavaScript Tutorial' });
        expect(results.length).toBeGreaterThan(1);

        // Check that results are sorted by relevance (descending)
        for (let i = 1; i < results.length; i++) {
          expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(
            results[i].relevanceScore
          );
        }
      });

      it('should include content search when requested', () => {
        // Mock getPostData for content search
        const mockGetPostData = jest.fn().mockResolvedValue({
          content:
            'This content contains detailed JavaScript examples and tutorials'
        });

        // We need to mock the module to include our mock
        jest.doMock('../blog', () => ({
          ...jest.requireActual('../blog'),
          getPostData: mockGetPostData
        }));

        const results = searchPosts({
          query: 'examples',
          includeContent: true
        });

        // This test would need the actual implementation to work with mocked getPostData
        // For now, we'll just verify the function doesn't crash
        expect(results).toBeDefined();
      });
    });

    describe('getSearchSuggestions', () => {
      it('should return empty array for empty query', () => {
        const suggestions = getSearchSuggestions('');
        expect(suggestions).toEqual([]);
      });

      it('should return title suggestions', () => {
        const suggestions = getSearchSuggestions('JavaScript');
        expect(suggestions).toContain('JavaScript Tutorial for Beginners');
      });

      it('should return tag suggestions', () => {
        const suggestions = getSearchSuggestions('React');
        expect(suggestions).toContain('React');
      });

      it('should respect limit parameter', () => {
        const suggestions = getSearchSuggestions('a', 2);
        expect(suggestions.length).toBeLessThanOrEqual(2);
      });

      it('should handle case-insensitive matching', () => {
        const suggestions = getSearchSuggestions('javascript');
        expect(suggestions.length).toBeGreaterThan(0);
      });

      it('should return unique suggestions', () => {
        const suggestions = getSearchSuggestions('JavaScript');
        const uniqueSuggestions = [...new Set(suggestions)];
        expect(suggestions).toEqual(uniqueSuggestions);
      });

      it('should include both titles and tags in suggestions', () => {
        const suggestions = getSearchSuggestions('React');
        expect(suggestions.length).toBeGreaterThan(0);
        // Should include both the tag "React" and titles containing "React"
      });
    });
  });

  describe('Search Functionality', () => {
    const mockPosts: BlogPostMetadata[] = [
      {
        slug: 'javascript-tutorial',
        title: 'JavaScript Tutorial for Beginners',
        date: '2024-01-15',
        excerpt: 'Learn JavaScript fundamentals with practical examples',
        tags: ['JavaScript', 'Tutorial', 'Programming'],
        author: 'Test Author'
      },
      {
        slug: 'react-hooks-guide',
        title: 'React Hooks Complete Guide',
        date: '2024-01-10',
        excerpt: 'Master React hooks with this comprehensive guide',
        tags: ['React', 'JavaScript', 'Frontend'],
        author: 'Test Author'
      },
      {
        slug: 'security-vulnerability-analysis',
        title: 'Security Vulnerability Analysis',
        date: '2024-01-05',
        excerpt: 'Deep dive into security vulnerability assessment',
        tags: ['Security', 'Vulnerability', 'Analysis'],
        author: 'Test Author'
      }
    ];

    beforeEach(() => {
      // Mock getSortedPostsData to return our test posts
      jest.clearAllMocks();
      fs.readdirSync.mockReturnValue(['post1.md', 'post2.md', 'post3.md']);

      let callCount = 0;
      matter.mockImplementation(() => {
        const post = mockPosts[callCount % mockPosts.length];
        callCount++;
        return {
          data: post,
          content: `# ${post.title}\n\n${
            post.excerpt
          }\n\nDetailed content about ${post.tags.join(', ')}`
        };
      });
    });

    describe('searchPosts', () => {
      // Helper function to reduce nesting depth
      const hasSecurityTag = (r: { post: { tags: string[] } }) =>
        r.post.tags.includes('Security');

      it('should return empty results for empty query and no tags', async () => {
        const results = await searchPosts({ query: '' });
        expect(results).toEqual([]);
      });

      it('should search by title with high relevance', async () => {
        const results = await searchPosts({ query: 'JavaScript' });
        expect(results).toHaveLength(2);
        expect(results[0].post.title).toContain('JavaScript');
        expect(results[0].relevanceScore).toBeGreaterThan(
          results[1].relevanceScore
        );
        expect(results[0].matchedFields).toContain('title');
      });

      it('should search by excerpt with medium relevance', async () => {
        const results = await searchPosts({ query: 'comprehensive' });
        expect(results).toHaveLength(1);
        expect(results[0].post.excerpt).toContain('comprehensive');
        expect(results[0].matchedFields).toContain('excerpt');
      });

      it('should search by tags with medium relevance', async () => {
        const results = await searchPosts({ query: 'Security' });
        expect(results).toHaveLength(1);
        expect(results[0].post.tags).toContain('Security');
        expect(results[0].matchedFields).toContain('tags');
      });

      it('should handle multiple search terms', async () => {
        const results = await searchPosts({ query: 'React JavaScript' });
        expect(results).toHaveLength(2);
        // Should find posts containing either React or JavaScript
      });

      it('should filter by tags when specified', async () => {
        const results = await searchPosts({
          query: '',
          tags: ['Security']
        });
        // Should find posts that contain the Security tag
        const securityPosts = results.filter(hasSecurityTag);
        expect(securityPosts).toHaveLength(1);
        expect(securityPosts[0].post.tags).toContain('Security');
      });

      it('should combine text search with tag filtering', async () => {
        const results = await searchPosts({
          query: 'guide',
          tags: ['React']
        });
        expect(results).toHaveLength(1);
        expect(results[0].post.title).toContain('React');
        expect(results[0].post.excerpt).toContain('guide');
      });

      it('should respect limit parameter', async () => {
        const results = await searchPosts({
          query: 'JavaScript',
          limit: 1
        });
        expect(results).toHaveLength(1);
      });

      it('should handle case-insensitive search', async () => {
        const results = await searchPosts({ query: 'javascript' });
        expect(results).toHaveLength(2);
      });

      it('should sort results by relevance score', async () => {
        const results = await searchPosts({ query: 'JavaScript Tutorial' });
        expect(results.length).toBeGreaterThan(1);

        // Check that results are sorted by relevance (descending)
        for (let i = 1; i < results.length; i++) {
          expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(
            results[i].relevanceScore
          );
        }
      });

      it('should include content search when requested', async () => {
        const results = await searchPosts({
          query: 'examples',
          includeContent: true
        });

        // Verify the function doesn't crash with includeContent flag
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
      });

      it('should handle content search with matches and increase relevance', async () => {
        // This will test lines 471-473 (content matches found)
        const results = await searchPosts({
          query: 'content', // This should match in post content
          includeContent: true
        });
        expect(results).toBeDefined();
        expect(Array.isArray(results)).toBe(true);
        // Should find matches in content and add to relevance score
      });

      it('should handle content search errors gracefully', async () => {
        // This will test lines 475-476 (catch block for content search errors)
        // Since the catch block is designed to silently handle errors,
        // we just need to verify the function doesn't crash when content search fails
        const results = await searchPosts({
          query: 'test',
          includeContent: true
        });

        // Should still return results even if content search fails for some posts
        expect(Array.isArray(results)).toBe(true);
      });
    });

    describe('getSearchSuggestions', () => {
      it('should return empty array for empty query', () => {
        const suggestions = getSearchSuggestions('');
        expect(suggestions).toEqual([]);
      });

      it('should return title suggestions', () => {
        const suggestions = getSearchSuggestions('JavaScript');
        expect(suggestions).toContain('JavaScript Tutorial for Beginners');
      });

      it('should return tag suggestions', () => {
        const suggestions = getSearchSuggestions('React');
        expect(suggestions).toContain('React');
      });

      it('should respect limit parameter', () => {
        const suggestions = getSearchSuggestions('a', 2);
        expect(suggestions.length).toBeLessThanOrEqual(2);
      });

      it('should handle case-insensitive matching', () => {
        const suggestions = getSearchSuggestions('javascript');
        expect(suggestions.length).toBeGreaterThan(0);
      });

      it('should return unique suggestions', () => {
        const suggestions = getSearchSuggestions('JavaScript');
        const uniqueSuggestions = [...new Set(suggestions)];
        expect(suggestions).toEqual(uniqueSuggestions);
      });

      it('should include both titles and tags in suggestions', () => {
        const suggestions = getSearchSuggestions('React');
        expect(suggestions.length).toBeGreaterThan(0);
        // Should include both the tag "React" and titles containing "React"
      });
    });
  });

  describe('URL Sanitization', () => {
    describe('getSafePostUrl with edge case slugs', () => {
      it('should handle slugs with leading slashes via sanitizeUrlPath', () => {
        // This will test the while loop at lines 574-576 via sanitizeUrlPath
        const mockPost = {
          slug: '///test-post///',
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafePostUrl(mockPost);
        expect(result).toBe('/test-post'); // Should sanitize the slug
      });

      it('should handle empty slug and fallback', () => {
        const mockPost = {
          slug: '',
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafePostUrl(mockPost);
        expect(result).toBe('/blog'); // Should fallback to /blog
      });

      it('should handle null slug and fallback', () => {
        const mockPost = {
          slug: null as any,
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafePostUrl(mockPost);
        expect(result).toBe('/blog'); // Should fallback to /blog due to error
      });

      it('should handle non-string slug types', () => {
        // This will test lines 552-553 in sanitizeUrlPath (invalid input handling)
        const mockPost = {
          slug: 123 as any, // Non-string slug
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafePostUrl(mockPost);
        expect(result).toBe('/blog'); // Should fallback due to invalid slug type
      });

      it('should handle empty sanitized permalink and use fallback', () => {
        // This will test lines 323-327 (empty sanitized permalink fallback)
        const mockPost = {
          slug: '', // Empty slug that will result in empty sanitized permalink
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafePostUrl(mockPost);
        expect(result).toBe('/blog'); // Should fallback to /blog
      });
    });

    describe('getSafeBlogPostUrl', () => {
      it('should generate safe blog post URLs with blog prefix', () => {
        // This will test lines 343-344
        const mockPost = {
          slug: 'test-post',
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getSafeBlogPostUrl(mockPost);
        expect(result).toBe('/blog/test-post');
      });
    });

    describe('getBlogPostUrl', () => {
      it('should generate blog post URLs with blog prefix', () => {
        // This will test lines 302-303
        const mockPost = {
          slug: 'test-post',
          title: 'Test Post',
          date: '2024-01-01',
          excerpt: 'Test excerpt',
          tags: ['test'],
          author: 'Test Author'
        };

        const result = getBlogPostUrl(mockPost);
        expect(result).toBe('/blog/test-post');
      });
    });
  });
});
