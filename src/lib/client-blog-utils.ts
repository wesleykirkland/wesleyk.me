// Client-safe blog utilities that don't depend on server-side APIs
import sanitizeHtml from 'sanitize-html';

export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  author: string;
  permalink?: string;
  featuredImage?: string;
  featuredImageLight?: string;
  featuredImageDark?: string;
  securityResearch?: {
    severity?: string;
    cve?: string;
    [key: string]: unknown;
  };
  caseStudy?: {
    type?: string;
    client?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Utility function to parse dates correctly without timezone issues
export function parsePostDate(dateString: string): Date {
  // For YYYY-MM-DD format, treat as local date to avoid timezone issues
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date in local timezone (month is 0-indexed)
    return new Date(year, month - 1, day);
  }

  // For other formats, use standard Date parsing
  return new Date(dateString);
}

// URL sanitization function using sanitize-html for security
function sanitizeUrlPath(path: string): string {
  // First sanitize any potential HTML/script content
  const cleanPath = sanitizeHtml(path, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });

  // Then apply URL-safe transformations
  return cleanPath
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-)|(-$)/g, '');
}

// Generate safe URL for a post
function generateSafeUrl(post: BlogPostMetadata, prefix?: string): string {
  try {
    const sanitizedSlug = sanitizeUrlPath(post.slug);

    if (!sanitizedSlug) {
      console.warn('Sanitized permalink is empty, using fallback');
      return prefix ? `/${prefix}` : '/blog';
    }

    return prefix ? `/${prefix}/${sanitizedSlug}` : `/${sanitizedSlug}`;
  } catch (error) {
    console.error('Error generating safe post URL:', error);
    return prefix ? `/${prefix}` : '/blog';
  }
}

export function getSafePostUrl(post: BlogPostMetadata): string {
  return generateSafeUrl(post);
}

export function getSafeBlogPostUrl(post: BlogPostMetadata): string {
  return generateSafeUrl(post, 'blog');
}

// Generate WordPress-style permalink
export function generateWordPressPermalink(date: string, slug: string): string {
  const dateObj = parsePostDate(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}/${slug}`;
}

export function getPostPermalink(post: BlogPostMetadata): string {
  if (!post.slug) {
    throw new Error('Invalid post slug');
  }
  return post.slug;
}

export function getWordPressPermalink(post: BlogPostMetadata): string {
  if (post.permalink) {
    return post.permalink.replace(/(^\/)|(\/$)/g, '');
  }
  return generateWordPressPermalink(post.date, post.slug);
}

export function getPostUrl(post: BlogPostMetadata): string {
  return `/${getPostPermalink(post)}`;
}

export function isWordPressPermalink(
  permalink: string,
  post: BlogPostMetadata
): boolean {
  const wpPermalink = getWordPressPermalink(post);
  return permalink === wpPermalink;
}

// Tag utilities
export function getTagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-)|(-$)/g, '');
}

// Featured image utilities
export function getFeaturedImage(
  post: BlogPostMetadata,
  theme?: 'light' | 'dark'
): string | undefined {
  if (theme === 'light' && post.featuredImageLight) {
    return post.featuredImageLight;
  }

  if (theme === 'dark' && post.featuredImageDark) {
    return post.featuredImageDark;
  }

  return post.featuredImage;
}
