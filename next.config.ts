import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Allows production builds to succeed even with TypeScript errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
  experimental: {
    // serverActions: true, // Enabled by default in v15
  },
};

export default nextConfig;
