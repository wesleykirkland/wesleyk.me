import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove 'export' output to enable API routes for contact form
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // distDir: 'out', // Not needed without static export
  skipTrailingSlashRedirect: true,

  // Exclude test files from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],

  // Configure webpack to exclude test files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader'
    });
    return config;
  },

  // ESLint configuration for build
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src']
  },

  // TypeScript configuration for build
  typescript: {
    ignoreBuildErrors: false
  },

  // Explicitly define environment variables for build time
  env: {
    NEXT_PUBLIC_PROFESSIONAL_TITLE: process.env.NEXT_PUBLIC_PROFESSIONAL_TITLE,
    NEXT_PUBLIC_FULL_TITLE: process.env.NEXT_PUBLIC_FULL_TITLE,
    NEXT_PUBLIC_NAME: process.env.NEXT_PUBLIC_NAME,
    NEXT_PUBLIC_TAGLINE: process.env.NEXT_PUBLIC_TAGLINE,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_GITHUB_URL: process.env.NEXT_PUBLIC_GITHUB_URL,
    NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
    NEXT_PUBLIC_YOUTUBE_PLAYLIST: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
    NEXT_PUBLIC_OVERTRACKING_SITE_ID:
      process.env.NEXT_PUBLIC_OVERTRACKING_SITE_ID
  }
};

export default nextConfig;
