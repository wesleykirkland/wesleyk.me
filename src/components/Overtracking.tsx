'use client';

import Script from 'next/script';

interface OvertrackingProps {
  siteId?: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    overtracking?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
      page: (name?: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export default function Overtracking({
  siteId = process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID,
  enabled = process.env.NODE_ENV === 'production'
}: Readonly<OvertrackingProps>) {
  // Don't render anything if disabled or no site ID
  if (!siteId || !enabled) {
    console.log('Overtracking: Disabled or missing site ID');
    return null;
  }

  return (
    <>
      {/* Overtracking Analytics Script with Site ID in URL */}
      <Script
        id="overtracking-analytics"
        src={`https://cdn.overtracking.com/t/${siteId}/`}
        strategy="afterInteractive"
        defer
        onLoad={() => {
          console.log('Overtracking: Script loaded successfully for site:', siteId);
        }}
        onError={(e) => {
          console.error('Overtracking: Failed to load script', e);
        }}
      />
    </>
  );
}

// Hook for tracking custom events
export function useOvertracking() {
  const track = (event: string, properties?: Record<string, unknown>) => {
    if (window.overtracking && process.env.NODE_ENV === 'production') {
      window.overtracking.track(event, properties);
      console.log('Overtracking: Event tracked:', event, properties);
    } else {
      console.log('Overtracking: Event would be tracked:', event, properties);
    }
  };

  const identify = (userId: string, traits?: Record<string, unknown>) => {
    if (window.overtracking && process.env.NODE_ENV === 'production') {
      window.overtracking.identify(userId, traits);
      console.log('Overtracking: User identified:', userId, traits);
    } else {
      console.log('Overtracking: User would be identified:', userId, traits);
    }
  };

  const page = (name?: string, properties?: Record<string, unknown>) => {
    if (window.overtracking && process.env.NODE_ENV === 'production') {
      window.overtracking.page(name, properties);
      console.log('Overtracking: Page tracked:', name, properties);
    } else {
      console.log('Overtracking: Page would be tracked:', name, properties);
    }
  };

  return { track, identify, page };
}
