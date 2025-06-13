import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['images.unsplash.com'],
    // Alternatively, for more complex patterns, use remotePatterns
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'images.unsplash.com',
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;
