import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import sanitizeHtml from 'sanitize-html';

// Utility function to parse dates correctly without timezone issues
export function parsePostDate(dateString: string): Date {
  // For YYYY-MM-DD format, treat as local date to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone (month is 0-indexed)
    return new Date(year, month - 1, day);
  }
  // For other formats, use standard parsing
  return new Date(dateString);
}

const postsDirectory = path.join(process.cwd(), 'posts');

// Shared type definitions to eliminate duplication
export type SecurityResearchMetadata = {
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: 'Disclosed' | 'In Progress' | 'Under Review' | 'Fixed';
  cve?: string;
  vendor?: string;
  disclosureDate?: string;
};

export type CaseStudyMetadata = {
  type?:
    | 'Security Assessment'
    | 'Penetration Test'
    | 'Code Review'
    | 'Compliance Audit'
    | 'Incident Response'
    | 'Marketing'
    | 'Other';
  client?: string;
  industry?: string;
  duration?: string;
  outcome?: string;
  technologies?: string[];
};

// Base interface for common blog post fields
interface BaseBlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  featuredImageLight?: string;
  featuredImageDark?: string;
  permalink?: string;
  wordpressUrl?: string;
  securityResearch?: SecurityResearchMetadata;
  caseStudy?: CaseStudyMetadata;
}

export interface BlogPost extends BaseBlogPost {
  content: string;
  images?: string[];
}

export type BlogPostMetadata = BaseBlogPost;

// Helper function to extract metadata from matter result (eliminates duplication)
function extractPostMetadata(
  slug: string,
  matterResult: matter.GrayMatterFile<string>
): BlogPostMetadata {
  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    excerpt: matterResult.data.excerpt,
    tags: matterResult.data.tags || [],
    author: matterResult.data.author || 'Wesley Kirkland',
    featuredImage: matterResult.data.featuredImage,
    featuredImageLight: matterResult.data.featuredImageLight,
    featuredImageDark: matterResult.data.featuredImageDark,
    permalink: matterResult.data.permalink,
    wordpressUrl: matterResult.data.wordpressUrl,
    securityResearch: matterResult.data.securityResearch,
    caseStudy: matterResult.data.caseStudy
  };
}

// Helper function to get the appropriate featured image based on theme
export function getFeaturedImage(
  post: BlogPostMetadata,
  theme?: 'light' | 'dark'
): string | undefined {
  // If theme-specific images are available, use them
  if (theme === 'dark' && post.featuredImageDark) {
    return post.featuredImageDark;
  }
  if (theme === 'light' && post.featuredImageLight) {
    return post.featuredImageLight;
  }

  // Fallback to default featured image
  return post.featuredImage;
}

export function getSortedPostsData(): BlogPostMetadata[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get id
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Extract metadata using helper function
      return extractPostMetadata(slug, matterResult);
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, '')
        }
      };
    });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Process image paths in markdown content
  const processedMarkdown = processImagePaths(matterResult.content, slug);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown support
    .use(html) // Convert to HTML first
    .process(processedMarkdown);
  const contentHtml = processedContent.toString();

  // Combine metadata with content and images
  const metadata = extractPostMetadata(slug, matterResult);
  return {
    ...metadata,
    content: contentHtml,
    images: matterResult.data.images ?? []
  };
}

export function getRecentPosts(count: number = 5): BlogPostMetadata[] {
  const allPosts = getSortedPostsData();
  return allPosts.slice(0, count);
}

// Helper function for filtering posts by metadata type and tags
function filterPostsByType(
  posts: BlogPostMetadata[],
  hasMetadata: (post: BlogPostMetadata) => boolean,
  fallbackTags: string[]
): BlogPostMetadata[] {
  return posts.filter(
    (post) =>
      hasMetadata(post) || post.tags.some((tag) => fallbackTags.includes(tag))
  );
}

export function getSecurityResearchPosts(): BlogPostMetadata[] {
  const allPosts = getSortedPostsData();
  return filterPostsByType(allPosts, (post) => !!post.securityResearch, [
    'Security',
    'Vulnerability',
    'CVE',
    'Research'
  ]);
}

export function getCaseStudyPosts(): BlogPostMetadata[] {
  const allPosts = getSortedPostsData();
  return filterPostsByType(allPosts, (post) => !!post.caseStudy, [
    'Case Study',
    'Assessment',
    'Penetration Test',
    'Security Audit',
    'Compliance',
    'Marketing'
  ]);
}

// Utility functions for handling blog images
export function getBlogImagePath(slug: string, imageName: string): string {
  const year = new Date().getFullYear();
  return `/images/blog/${year}/${slug}/${imageName}`;
}

export function getBlogImageUrl(slug: string, imageName: string): string {
  return getBlogImagePath(slug, imageName);
}

// Process markdown content to handle relative image paths
export function processImagePaths(content: string, slug: string): string {
  // Replace relative image paths with absolute paths
  return content.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
    (match, alt, src) => {
      // If the path starts with /, it's already absolute
      if (src.startsWith('/')) {
        return match;
      }
      // Convert relative path to absolute blog image path
      const imagePath = getBlogImagePath(slug, src);
      return `![${alt}](${imagePath})`;
    }
  );
}

// Permalink utility functions
export function generateWordPressPermalink(date: string, slug: string): string {
  const dateObj = parsePostDate(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}/${slug}`;
}

export function getPostPermalink(post: BlogPostMetadata): string {
  // Always use the modern clean URL (slug-based)
  // Validate that the slug is safe
  if (!post.slug || typeof post.slug !== 'string') {
    throw new Error('Invalid post slug');
  }

  // Additional validation to prevent XSS
  if (
    post.slug.includes('<') ??
    post.slug.includes('>') ??
    post.slug.includes('"') ??
    post.slug.includes("'")
  ) {
    throw new Error('Post slug contains potentially dangerous characters');
  }

  return post.slug;
}

export function getWordPressPermalink(post: BlogPostMetadata): string {
  // If custom permalink is defined, use it (for backward compatibility)
  if (post.permalink) {
    return post.permalink;
  }

  // If WordPress URL is defined, use it
  if (post.wordpressUrl) {
    return post.wordpressUrl;
  }

  // Default to WordPress-style permalink
  return generateWordPressPermalink(post.date, post.slug);
}

// Helper function for URL generation (eliminates duplication)
function generateUrl(post: BlogPostMetadata, prefix: string = ''): string {
  const permalink = getPostPermalink(post);
  const sanitizedPermalink = sanitizeUrlPath(permalink);
  return prefix ? `/${prefix}/${sanitizedPermalink}` : `/${sanitizedPermalink}`;
}

export function getPostUrl(post: BlogPostMetadata): string {
  return generateUrl(post);
}

export function getBlogPostUrl(post: BlogPostMetadata): string {
  return generateUrl(post, 'blog');
}

// Safe URL functions using sanitize-html library
// These functions prevent XSS and injection attacks by:
// 1. Using battle-tested sanitize-html library for comprehensive security
// 2. Applying strict configuration (no tags, attributes, or protocols allowed)
// 3. Additional whitelist filtering for URL-safe characters only
// 4. Providing safe fallbacks on error
//
// Benefits of using sanitize-html:
// - Maintained by security experts
// - Regular security updates
// - Comprehensive attack vector coverage
// - Simpler and more reliable than custom sanitization
// Helper function for safe URL generation with error handling (eliminates duplication)
function generateSafeUrl(post: BlogPostMetadata, prefix: string = ''): string {
  try {
    const permalink = getPostPermalink(post);
    const sanitizedPermalink = sanitizeUrlPath(permalink);

    // Additional safety check for empty result
    if (!sanitizedPermalink) {
      console.warn('Sanitized permalink is empty, using fallback');
      return '/blog';
    }

    return prefix
      ? `/${prefix}/${sanitizedPermalink}`
      : `/${sanitizedPermalink}`;
  } catch (error) {
    console.error('Error generating safe post URL:', error);
    return '/blog'; // Fallback to blog index
  }
}

export function getSafePostUrl(post: BlogPostMetadata): string {
  return generateSafeUrl(post);
}

export function getSafeBlogPostUrl(post: BlogPostMetadata): string {
  return generateSafeUrl(post, 'blog');
}

// Find post by permalink (for routing)
export function getPostByPermalink(permalink: string): BlogPostMetadata | null {
  const allPosts = getSortedPostsData();

  // First, try to find by modern permalink (slug)
  let post = allPosts.find((p) => getPostPermalink(p) === permalink);

  if (!post) {
    // Try to find by WordPress-style permalink (for backward compatibility)
    post = allPosts.find((p) => getWordPressPermalink(p) === permalink);
  }

  if (!post) {
    // Try to find by slug (fallback for direct slug access)
    post = allPosts.find((p) => p.slug === permalink);
  }

  return post || null;
}

// Check if a permalink is a WordPress-style URL that should redirect
export function isWordPressPermalink(
  permalink: string,
  post: BlogPostMetadata
): boolean {
  const wpPermalink = getWordPressPermalink(post);
  const modernPermalink = getPostPermalink(post);
  return permalink === wpPermalink && permalink !== modernPermalink;
}

// Tag utility functions
export function getAllTags(): string[] {
  const allPosts = getSortedPostsData();
  const tagSet = new Set<string>();

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export function getPostsByTag(tag: string): BlogPostMetadata[] {
  const allPosts = getSortedPostsData();
  return allPosts.filter((post) =>
    post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
  );
}

export function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-)|(-$)/g, '');
}

// Search functionality
export interface SearchOptions {
  query: string;
  tags?: string[];
  limit?: number;
  includeContent?: boolean;
}

export interface SearchResult {
  post: BlogPostMetadata;
  relevanceScore: number;
  matchedFields: string[];
}

// Helper function to calculate relevance score for a post
async function calculatePostRelevance(
  post: BlogPostMetadata,
  searchTerms: string[],
  includeContent: boolean
): Promise<{ relevanceScore: number; matchedFields: string[] }> {
  let relevanceScore = 0;
  const matchedFields: string[] = [];

  // Search in title (highest weight)
  const titleMatches = searchTerms.filter((term) =>
    post.title.toLowerCase().includes(term)
  );
  if (titleMatches.length > 0) {
    relevanceScore += titleMatches.length * 10;
    matchedFields.push('title');
  }

  // Search in excerpt (medium weight)
  const excerptMatches = searchTerms.filter((term) =>
    post.excerpt.toLowerCase().includes(term)
  );
  if (excerptMatches.length > 0) {
    relevanceScore += excerptMatches.length * 5;
    matchedFields.push('excerpt');
  }

  // Search in tags (medium weight)
  const tagMatches = searchTerms.filter((term) =>
    post.tags.some((tag) => tag.toLowerCase().includes(term))
  );
  if (tagMatches.length > 0) {
    relevanceScore += tagMatches.length * 5;
    matchedFields.push('tags');
  }

  // Search in content if requested (lower weight)
  if (includeContent) {
    try {
      const postData = await getPostData(post.slug);
      const contentMatches = searchTerms.filter((term) =>
        postData.content.toLowerCase().includes(term)
      );
      if (contentMatches.length > 0) {
        relevanceScore += contentMatches.length * 2;
        matchedFields.push('content');
      }
    } catch {
      // Skip content search if post data can't be loaded
    }
  }

  return { relevanceScore, matchedFields };
}

// Helper function to apply tag filtering
function applyTagFilter(
  post: BlogPostMetadata,
  tags: string[] | undefined,
  query: string,
  baseScore: number,
  matchedFields: string[]
): { relevanceScore: number; shouldInclude: boolean } {
  if (!tags || tags.length === 0) {
    return { relevanceScore: baseScore, shouldInclude: baseScore > 0 };
  }

  const hasMatchingTag = tags.some((tag) =>
    post.tags.some(
      (postTag: string) => postTag.toLowerCase() === tag.toLowerCase()
    )
  );

  if (hasMatchingTag) {
    const relevanceScore = baseScore + 3;
    if (!matchedFields.includes('tags')) {
      matchedFields.push('tags');
    }
    return { relevanceScore, shouldInclude: true };
  }

  if (query.trim() === '') {
    // If only filtering by tags and no text query, include posts with matching tags
    matchedFields.push('tags');
    return { relevanceScore: 1, shouldInclude: true };
  }

  return { relevanceScore: baseScore, shouldInclude: false };
}

export async function searchPosts(
  options: SearchOptions
): Promise<SearchResult[]> {
  const { query, tags, limit, includeContent = false } = options;
  const allPosts = getSortedPostsData();

  if (!query.trim() && (!tags || tags.length === 0)) {
    return [];
  }

  const searchTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  // Process posts in parallel for better performance
  const postResults = await Promise.all(
    allPosts.map(async (post) => {
      const { relevanceScore, matchedFields } = await calculatePostRelevance(
        post,
        searchTerms,
        includeContent
      );
      return { post, relevanceScore, matchedFields };
    })
  );

  // Filter and process results
  const results: SearchResult[] = [];

  for (const {
    post,
    relevanceScore: baseScore,
    matchedFields
  } of postResults) {
    const { relevanceScore, shouldInclude } = applyTagFilter(
      post,
      tags,
      query,
      baseScore,
      matchedFields
    );

    if (shouldInclude) {
      results.push({
        post,
        relevanceScore,
        matchedFields
      });
    }
  }

  // Sort by relevance score (descending)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Apply limit if specified
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

export function getSearchSuggestions(
  query: string,
  limit: number = 5
): string[] {
  if (!query.trim()) {
    return [];
  }

  const allPosts = getSortedPostsData();
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Get title suggestions
  for (const post of allPosts) {
    if (post.title.toLowerCase().includes(queryLower)) {
      suggestions.add(post.title);
    }

    // Get tag suggestions
    for (const tag of post.tags) {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    }

    if (suggestions.size >= limit * 2) break;
  }

  return Array.from(suggestions).slice(0, limit);
}

// URL sanitization using battle-tested sanitize-html library
// This approach is much simpler and more secure than custom sanitization
function sanitizeUrlPath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Use sanitize-html with strict configuration for URL paths
  const sanitized = sanitizeHtml(path, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {}, // No attributes allowed
    allowedSchemes: [], // No protocols allowed
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [],
    allowProtocolRelative: false,
    enforceHtmlBoundary: false,
    parseStyleAttributes: false
  });

  // Additional cleanup for URL path safety
  let cleaned = sanitized
    .replace(/[^a-zA-Z0-9\-_./]/g, '') // Only allow safe URL characters
    .replace(/\/+/g, '/'); // Collapse multiple slashes

  // Remove leading/trailing slashes safely (no ReDoS vulnerability)
  // Use simple string methods instead of vulnerable regex
  while (cleaned.startsWith('/')) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }

  return cleaned;
}

export function getTagFromSlug(slug: string): string | null {
  const allTags = getAllTags();
  return allTags.find((tag) => getTagSlug(tag) === slug) ?? null;
}
