/**
 * Common test data factories
 * Centralizes test data creation to reduce duplication
 */

import type { BlogPostMetadata } from '@/lib/blog';

// Blog post test data factory
export const createMockBlogPost = (
  overrides: Partial<BlogPostMetadata> = {}
): BlogPostMetadata => ({
  title: 'Test Post',
  slug: 'test-post',
  date: '2024-01-01',
  excerpt: 'Test excerpt',
  tags: ['test', 'blog'],
  author: 'Test Author',
  readingTime: 5,
  wordCount: 1000,
  ...overrides
});

// Blog post with featured images
export const createMockBlogPostWithImages = (
  overrides: Partial<BlogPostMetadata> = {}
): BlogPostMetadata => ({
  ...createMockBlogPost(),
  featuredImage: '/images/default.jpg',
  featuredImageLight: '/images/light.jpg',
  featuredImageDark: '/images/dark.jpg',
  ...overrides
});

// Blog post without theme-specific images
export const createMockBlogPostWithoutThemeImages = (
  overrides: Partial<BlogPostMetadata> = {}
): BlogPostMetadata => ({
  ...createMockBlogPost(),
  featuredImage: '/images/default.jpg',
  ...overrides
});

// Blog post without any images
export const createMockBlogPostWithoutImages = (
  overrides: Partial<BlogPostMetadata> = {}
): BlogPostMetadata => ({
  ...createMockBlogPost(),
  ...overrides
});

// Contact form data factory
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken?: string;
}

export const createValidContactFormData = (
  overrides: Partial<ContactFormData> = {}
): ContactFormData => ({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message:
    'This is a test message with sufficient length to pass validation requirements. It has more than 100 characters to ensure it meets the minimum length requirement for the message field in the contact form.',
  captchaToken: 'valid-captcha-token',
  ...overrides
});

export const createInvalidContactFormData = (
  overrides: Partial<ContactFormData> = {}
): ContactFormData => ({
  name: '',
  email: 'invalid-email',
  subject: '',
  message: 'Short',
  ...overrides
});

// hCaptcha response data
export const createMockCaptchaSuccessResponse = (overrides: any = {}) => ({
  success: true,
  challenge_ts: '2024-03-15T10:00:00Z',
  hostname: 'localhost',
  ...overrides
});

export const createMockCaptchaFailureResponse = (overrides: any = {}) => ({
  success: false,
  'error-codes': ['invalid-input-response'],
  ...overrides
});

// API response factories
export const createSuccessApiResponse = (data: any = {}) => ({
  success: true,
  ...data
});

export const createErrorApiResponse = (error: string, code: number = 400) => ({
  success: false,
  error,
  code
});

// File system mock data
export const createMockFileSystemData = () => ({
  files: ['post1.md', 'post2.md', 'post3.md'],
  fileContent: '# Test Post\n\nContent here',
  matterData: {
    title: 'Test Post',
    date: '2024-01-01',
    tags: ['test', 'blog'],
    excerpt: 'Test excerpt',
    author: 'Test Author'
  }
});

// Cat API data
export const createMockCatData = (overrides: any = {}) => ({
  success: true,
  image: '/cats/cat1.jpg',
  filename: 'cat1.jpg',
  url: 'http://localhost:3000/cats/cat1.jpg',
  timestamp: '2024-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockCatImages = () => [
  'cat1.jpg',
  'cat2.png',
  'cat3.gif',
  'cat4.webp'
];

// Search data
export const createMockSearchResults = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) =>
    createMockBlogPost({
      title: `Search Result ${i + 1}`,
      slug: `search-result-${i + 1}`,
      excerpt: `This is search result ${i + 1} excerpt`
    })
  );
};

// Tag data
export const createMockTags = () => [
  'JavaScript',
  'React',
  'Next.js',
  'TypeScript',
  'Testing',
  'Security'
];

// Validation error data
export const createValidationErrors = (fields: string[] = []) => {
  const errors: Record<string, string> = {};
  fields.forEach((field) => {
    errors[field] = `${field} is required`;
  });
  return errors;
};

// Network response factories
export const createMockFetchResponse = (data: any, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
});

export const createMockFetchError = (message: string = 'Network error') => {
  throw new Error(message);
};

// Date utilities for tests
export const createTestDate = (dateString: string = '2024-01-01') =>
  new Date(dateString);

export const createTestTimestamp = (dateString: string = '2024-01-01') =>
  createTestDate(dateString).toISOString();

// URL utilities for tests
export const createTestUrl = (
  path: string = '/',
  base: string = 'http://localhost:3000'
) => new URL(path, base);

// Request utilities for tests
export const createMockRequest = (url: string, options: any = {}) => ({
  url,
  method: 'GET',
  headers: new Headers(),
  ...options
});

// Response utilities for tests
export const createMockResponse = (data: any, status: number = 200) => ({
  status,
  ok: status >= 200 && status < 300,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
});

// Error factories
export const createTestError = (message: string = 'Test error') =>
  new Error(message);

export const createValidationError = (
  field: string,
  message: string = 'Invalid input'
) => ({
  field,
  message,
  code: 'VALIDATION_ERROR'
});

// Theme utilities
export const setupDarkTheme = () => {
  document.documentElement.classList.add('dark');
};

export const setupLightTheme = () => {
  document.documentElement.classList.remove('dark');
};

export const resetTheme = () => {
  document.documentElement.classList.remove('dark');
};
