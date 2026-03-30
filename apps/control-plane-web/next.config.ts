import type { NextConfig } from 'next';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function resolveFromControlPlane(request: string): string {
  return require.resolve(request, {
    paths: [process.cwd()],
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('../..', import.meta.url).pathname,
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'react$': resolveFromControlPlane('react'),
      'react-dom$': resolveFromControlPlane('react-dom'),
      'react/jsx-runtime': resolveFromControlPlane('react/jsx-runtime'),
      'react/jsx-dev-runtime': resolveFromControlPlane('react/jsx-dev-runtime'),
    };

    return config;
  },
};

export default nextConfig;
