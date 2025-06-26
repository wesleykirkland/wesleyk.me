'use client';

import { usePageTracking } from '@/hooks/usePageTracking';

interface PageTrackerProps {
  pageName?: string;
  pageType?: string;
  customProperties?: Record<string, unknown>;
  trackSearchParams?: boolean;
}

export default function PageTracker({
  pageName,
  pageType,
  customProperties = {},
  trackSearchParams = false
}: PageTrackerProps) {
  // Enhanced properties with page-specific data
  const enhancedProperties = {
    pageType,
    pageName,
    ...customProperties
  };

  // Use the page tracking hook
  usePageTracking({
    enabled: true,
    trackSearchParams,
    customProperties: enhancedProperties
  });

  // This component doesn't render anything
  return null;
}
