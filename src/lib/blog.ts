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
  return `/${permalink}`;
}

export function getBlogPostUrl(post: BlogPostMetadata): string {
  const permalink = getPostPermalink(post);
  return `/blog/${permalink}`;
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
    .replace(/^-|-$/g, '');
}

export function getTagFromSlug(slug: string): string | null {
  const allTags = getAllTags();
  return allTags.find((tag) => getTagSlug(tag) === slug) || null;
}
