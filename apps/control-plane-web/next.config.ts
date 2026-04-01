import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('../..', import.meta.url).pathname,
  transpilePackages: ['@mobility-os/ui'],
};

export default nextConfig;
