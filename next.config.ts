import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'export' output to enable API routes for contact form
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // distDir: 'out', // Not needed without static export
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
