'use client';

import { useState, useEffect } from 'react';
import { sanitizeCatUrl } from '@/lib/urlSanitizer';

interface CatLinkProps {
  children: React.ReactNode;
  className?: string;
}

interface CatData {
  success: boolean;
  image?: string;
  url?: string;
  error?: string;
}

export default function CatLink({
  children,
  className = ''
}: Readonly<CatLinkProps>) {
  const [catUrl, setCatUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatUrl = async () => {
      try {
        const response = await fetch('/api/cat');
        const data: CatData = await response.json();

        if (data.success && data.url) {
          const sanitizedUrl = sanitizeCatUrl(data.url);
          setCatUrl(sanitizedUrl || '/api/cat'); // Use fallback if sanitization fails
        } else {
          // Fallback to a placeholder or the API endpoint itself
          setCatUrl('/api/cat');
        }
      } catch (error) {
        console.error('Failed to fetch cat URL:', error);
        // Fallback to the API endpoint
        setCatUrl('/api/cat');
      } finally {
        setLoading(false);
      }
    };

    fetchCatUrl();
  }, []);

  if (loading) {
    // Return non-clickable text while loading
    return <span className={className}>{children}</span>;
  }

  // Double-check URL sanitization before rendering
  const safeCatUrl = sanitizeCatUrl(catUrl) || '/api/cat';

  return (
    <a
      href={safeCatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 dark:text-blue-400 hover:underline ${className}`}
      title="Click to see a random cat image!"
    >
      {children}
    </a>
  );
}
