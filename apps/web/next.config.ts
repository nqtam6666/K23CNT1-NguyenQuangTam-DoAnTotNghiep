import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  reactStrictMode: true,
  transpilePackages: ['@lms/chung'],
  devIndicators: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  onDemandEntries: {
    maxInactiveAge: 24 * 60 * 60 * 1000,
    pagesBufferLength: 100,
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
