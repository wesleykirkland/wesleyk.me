'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface PageTrackingOptions {
  enabled?: boolean;
  trackSearchParams?: boolean;
  customProperties?: Record<string, unknown>;
}

export function usePageTracking(options: PageTrackingOptions = {}) {
  const pathname = usePathname();

  const {
    enabled = process.env.NODE_ENV === 'production',
    trackSearchParams = false,
    customProperties = {}
  } = options;

  useEffect(() => {
    if (!enabled || !pathname) return;

    // Track page view with Overtracking
    const trackPageView = () => {
      if (typeof window !== 'undefined' && window.overtracking) {
        const properties: Record<string, unknown> = {
          path: pathname,
          url: window.location.href,
          title: document.title,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          ...customProperties
        };

        // Include search parameters if enabled (client-side only)
        if (trackSearchParams) {
          const urlParams = new URLSearchParams(window.location.search);
          const params: Record<string, string> = {};
          urlParams.forEach((value: string, key: string) => {
            params[key] = value;
          });
          if (Object.keys(params).length > 0) {
            properties.searchParams = params;
          }
        }

        // Track the page view
        try {
          window.overtracking.page(pathname, properties);
          console.log('Overtracking: Page view tracked', {
            page: pathname,
            properties
          });
        } catch (error) {
          console.error('Overtracking: Error tracking page view', error);
        }
      } else if (enabled) {
        // console.log('Overtracking: Page view would be tracked', {
        //   page: pathname,
        //   enabled
        // });
      }
    };

    // Track immediately if Overtracking is available, otherwise wait a bit
    if (typeof window !== 'undefined' && window.overtracking) {
      trackPageView();
    } else {
      const timer = setTimeout(trackPageView, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, enabled, trackSearchParams, customProperties]);
}

// Hook for tracking specific page events
export function useEventTracking() {
  const track = (event: string, properties?: Record<string, unknown>) => {
    if (window.overtracking && process.env.NODE_ENV === 'production') {
      const eventProperties = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        url: window.location.href,
        ...properties
      };

      try {
        window.overtracking.track(event, eventProperties);
        // Avoid logging event details to prevent potential information exposure
        console.log('Overtracking: Event tracked');
      } catch (error) {
        console.error('Overtracking: Error tracking event', error);
      }
    } else {
      console.log('Overtracking: Event would be tracked in production');
    }
  };

  return { track };
}

// Predefined tracking functions for common events
export const trackingEvents = {
  // Navigation events
  linkClick: (url: string, text?: string) => {
    if (window.overtracking) {
      window.overtracking.track('Link Clicked', {
        url,
        text,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Content engagement
  blogPostView: (postTitle: string, postSlug: string, tags?: string[]) => {
    if (window.overtracking) {
      window.overtracking.track('Blog Post Viewed', {
        title: postTitle,
        slug: postSlug,
        tags,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Contact form events
  contactFormSubmit: (success: boolean, error?: string) => {
    if (window.overtracking) {
      window.overtracking.track('Contact Form Submitted', {
        success,
        error,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Search events
  searchPerformed: (query: string, resultsCount?: number) => {
    if (window.overtracking) {
      window.overtracking.track('Search Performed', {
        query,
        resultsCount,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Tag navigation
  tagClicked: (tag: string, fromPage?: string) => {
    if (window.overtracking) {
      window.overtracking.track('Tag Clicked', {
        tag,
        fromPage,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Social media clicks
  socialLinkClick: (platform: string, url: string) => {
    if (window.overtracking) {
      window.overtracking.track('Social Link Clicked', {
        platform,
        url,
        timestamp: new Date().toISOString()
      });
    }
  },

  // File downloads
  fileDownload: (fileName: string, fileType: string, fileSize?: number) => {
    if (window.overtracking) {
      window.overtracking.track('File Downloaded', {
        fileName,
        fileType,
        fileSize,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, page: string) => {
    if (window.overtracking) {
      window.overtracking.track('Error Occurred', {
        errorType,
        errorMessage,
        page,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Global Window interface is already declared in Overtracking.tsx
