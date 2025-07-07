/**
 * URL Sanitization Utility
 *
 * Prevents DOM-based XSS attacks by validating and sanitizing URLs
 * before they are used in href attributes or other contexts.
 */

// Helper function to validate URL protocol
function isValidProtocol(protocol: string): boolean {
  return ['http:', 'https:'].includes(protocol);
}

// Helper function to check if path is allowed
function isPathAllowed(pathname: string, allowedPaths?: string[]): boolean {
  if (!allowedPaths || allowedPaths.length === 0) {
    return true;
  }
  return allowedPaths.some((path) => pathname.startsWith(path));
}

// Helper function to check if domain is allowed
function isDomainAllowed(hostname: string, allowedDomains?: string[]): boolean {
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }
  return allowedDomains.some(
    (domain) => hostname === domain || hostname.endsWith('.' + domain)
  );
}

/**
 * Sanitizes a URL to prevent XSS attacks
 * @param url - The URL to sanitize
 * @param allowedPaths - Optional array of allowed path prefixes for same-origin URLs
 * @param allowedDomains - Optional array of allowed external domains
 * @returns Sanitized URL or empty string if invalid/dangerous
 */
export function sanitizeUrl(
  url: string,
  allowedPaths?: string[],
  allowedDomains?: string[]
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    // Parse the URL to validate it
    const parsedUrl = new URL(
      url,
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'
    );

    // Only allow http and https protocols
    if (!isValidProtocol(parsedUrl.protocol)) {
      console.warn(
        'Blocked potentially dangerous URL protocol:',
        parsedUrl.protocol
      );
      return '';
    }

    // For relative URLs or same-origin URLs, check allowed paths
    if (
      typeof window !== 'undefined' &&
      parsedUrl.origin === window.location.origin
    ) {
      if (!isPathAllowed(parsedUrl.pathname, allowedPaths)) {
        console.warn('Blocked URL outside allowed paths:', parsedUrl.pathname);
        return '';
      }
      return parsedUrl.href;
    }

    // For external URLs, check allowed domains if specified
    if (!isDomainAllowed(parsedUrl.hostname, allowedDomains)) {
      console.warn('Blocked URL from disallowed domain:', parsedUrl.hostname);
      return '';
    }

    return parsedUrl.href;
  } catch (error) {
    console.error('Invalid URL provided:', url, error);
    return ''; // Return empty string for invalid URLs
  }
}

/**
 * Sanitizes URLs specifically for cat-related components
 * Only allows /cats/ paths and /api/cat for same-origin URLs
 */
export function sanitizeCatUrl(url: string): string {
  return sanitizeUrl(url, ['/cats/', '/api/cat']);
}

/**
 * Sanitizes URLs for blog-related components
 * Allows blog paths, tag paths, and API endpoints
 */
export function sanitizeBlogUrl(url: string): string {
  return sanitizeUrl(url, ['/blog/', '/tag/', '/api/', '/']);
}

/**
 * Sanitizes external URLs with a whitelist of trusted domains
 * Useful for social media links, external resources, etc.
 */
export function sanitizeExternalUrl(
  url: string,
  trustedDomains: string[] = []
): string {
  const defaultTrustedDomains = [
    'github.com',
    'linkedin.com',
    'youtube.com',
    'twitter.com',
    'x.com'
  ];

  return sanitizeUrl(url, undefined, [
    ...defaultTrustedDomains,
    ...trustedDomains
  ]);
}
