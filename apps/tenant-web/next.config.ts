import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@mobility-os/ui'],
};

export default nextConfig;
