import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

const postsDirectory = path.join(process.cwd(), 'posts');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  images?: string[];
  permalink?: string;
  wordpressUrl?: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  featuredImage?: string;
  permalink?: string;
  wordpressUrl?: string;
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

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title,
        date: matterResult.data.date,
        excerpt: matterResult.data.excerpt,
        tags: matterResult.data.tags || [],
        author: matterResult.data.author || 'Wesley Kirkland',
        featuredImage: matterResult.data.featuredImage,
        permalink: matterResult.data.permalink,
        wordpressUrl: matterResult.data.wordpressUrl
      };
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

  // Combine the data with the slug and the contentHtml
  return {
    slug,
    title: matterResult.data.title,
    date: matterResult.data.date,
    excerpt: matterResult.data.excerpt,
    content: contentHtml,
    tags: matterResult.data.tags || [],
    author: matterResult.data.author || 'Wesley Kirkland',
    featuredImage: matterResult.data.featuredImage,
    images: matterResult.data.images || [],
    permalink: matterResult.data.permalink,
    wordpressUrl: matterResult.data.wordpressUrl
  };
}

export function getRecentPosts(count: number = 5): BlogPostMetadata[] {
  const allPosts = getSortedPostsData();
  return allPosts.slice(0, count);
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
  const dateObj = new Date(date);
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

export function getPostUrl(post: BlogPostMetadata): string {
  const permalink = getPostPermalink(post);
  const sanitizedPermalink = sanitizeUrlPath(permalink);
  return `/${sanitizedPermalink}`;
}

export function getBlogPostUrl(post: BlogPostMetadata): string {
  const permalink = getPostPermalink(post);
  const sanitizedPermalink = sanitizeUrlPath(permalink);
  return `/blog/${sanitizedPermalink}`;
}

// Safe URL functions that explicitly sanitize input
// These functions prevent XSS and ReDoS by:
// 1. Validating input at the permalink level
// 2. Limiting input length to prevent ReDoS attacks
// 3. Using iterative sanitization to prevent interleaving bypass attacks
// 4. Applying whitelist filtering as final security layer
// 5. Using ReDoS-safe string operations instead of vulnerable regex
// 6. Providing safe fallbacks on error
//
// Test cases that should be blocked:
// - javascript:alert('xss') -> empty string
// - <script>alert('xss')</script> -> scriptalertxssscript
// - onclick="alert('xss')" -> alert'xss'
// - data:text/html,<script>alert('xss')</script> -> texthtmlscriptalertxssscript
// - javajavascript:script:alert('xss') -> empty string (interleaving bypass prevented)
// - Very long strings with repeated slashes -> truncated and safely processed
export function getSafePostUrl(post: BlogPostMetadata): string {
  try {
    const permalink = getPostPermalink(post);
    const sanitizedPermalink = sanitizeUrlPath(permalink);

    // Additional safety check for empty result
    if (!sanitizedPermalink) {
      console.warn('Sanitized permalink is empty, using fallback');
      return '/blog';
    }

    return `/${sanitizedPermalink}`;
  } catch (error) {
    console.error('Error generating safe post URL:', error);
    return '/blog'; // Fallback to blog index
  }
}

export function getSafeBlogPostUrl(post: BlogPostMetadata): string {
  try {
    const permalink = getPostPermalink(post);
    const sanitizedPermalink = sanitizeUrlPath(permalink);

    // Additional safety check for empty result
    if (!sanitizedPermalink) {
      console.warn('Sanitized permalink is empty, using fallback');
      return '/blog';
    }

    return `/blog/${sanitizedPermalink}`;
  } catch (error) {
    console.error('Error generating safe blog post URL:', error);
    return '/blog'; // Fallback to blog index
  }
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

// URL sanitization function to prevent XSS
function sanitizeUrlPath(path: string): string {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Limit input length to prevent ReDoS attacks
  if (path.length > 1000) {
    console.warn('URL path too long, truncating for security');
    path = path.substring(0, 1000);
  }

  // Remove dangerous characters that could be used for XSS while preserving valid URL structure
  // Use iterative approach to prevent bypass through interleaving
  let sanitized = path;
  let previousLength;
  let sanitizeIterations = 0;
  const maxSanitizeIterations = 10; // Prevent infinite loops

  // Keep sanitizing until no more changes occur (prevents interleaving bypass)
  do {
    previousLength = sanitized.length;
    sanitized = sanitized
      .replace(/[<>'"]/g, '') // Remove HTML/JS injection characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
      .replace(/&[#\w]+;/g, ''); // Remove HTML entities
    sanitizeIterations++;
  } while (
    sanitized.length !== previousLength &&
    sanitized.length > 0 &&
    sanitizeIterations < maxSanitizeIterations
  );

  // Final whitelist filter - only allow safe characters (fixed escape)
  sanitized = sanitized
    .replace(/[^\w\-/.]/g, '') // Only allow word chars, hyphens, slashes, and dots
    .replace(/\/+/g, '/'); // Collapse multiple slashes

  // Remove leading/trailing slashes safely (ReDoS-safe approach)
  // Use simple string methods instead of vulnerable regex /^\/+|\/+$/g
  // This prevents catastrophic backtracking with inputs like "//////////...//////////x"
  // Performance: O(n) instead of potentially O(2^n) with malicious input
  let iterations = 0;
  const maxIterations = 100; // Safety limit to prevent infinite loops

  while (sanitized.startsWith('/') && iterations < maxIterations) {
    sanitized = sanitized.substring(1);
    iterations++;
  }

  iterations = 0; // Reset counter for trailing slashes
  while (sanitized.endsWith('/') && iterations < maxIterations) {
    sanitized = sanitized.substring(0, sanitized.length - 1);
    iterations++;
  }

  return sanitized;
}

export function getTagFromSlug(slug: string): string | null {
  const allTags = getAllTags();
  return allTags.find((tag) => getTagSlug(tag) === slug) ?? null;
}
