import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  outputFileTracingRoot: new URL('../..', import.meta.url).pathname,
};

export default nextConfig;
