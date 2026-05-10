import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow external image domains for user avatars
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
    ],
  },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
};

export default nextConfig;
