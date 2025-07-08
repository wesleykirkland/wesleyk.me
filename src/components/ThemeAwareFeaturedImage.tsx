'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { BlogPostMetadata } from '@/lib/blog';

interface ThemeAwareFeaturedImageProps {
  post: BlogPostMetadata;
  className?: string;
}

export default function ThemeAwareFeaturedImage({
  post,
  className = 'w-full h-auto rounded-lg'
}: ThemeAwareFeaturedImageProps) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Function to detect current theme
    const detectTheme = () => {
      if (document.documentElement.classList.contains('dark')) {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('light');
      }
    };

    // Initial theme detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          detectTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Determine which image to use
  const getImageSrc = (): string | undefined => {
    // If theme-specific images are available, use them
    if (currentTheme === 'dark' && post.featuredImageDark) {
      return post.featuredImageDark;
    }
    if (currentTheme === 'light' && post.featuredImageLight) {
      return post.featuredImageLight;
    }

    // Fallback to default featured image
    return post.featuredImage;
  };

  const imageSrc = getImageSrc();

  // Don't render if no image is available
  if (!imageSrc) {
    return null;
  }

  return (
    <div className="mb-8">
      <Image
        src={imageSrc}
        alt={post.title}
        width={0}
        height={0}
        sizes="100vw"
        className={className}
        priority={false}
      />
    </div>
  );
}
