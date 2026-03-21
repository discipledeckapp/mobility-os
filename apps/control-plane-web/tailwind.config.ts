import type { Config } from 'tailwindcss';
import rootConfig from '../../tailwind.config';

const config: Config = {
  ...rootConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/*.{ts,tsx}',
    '../../packages/ui/brand/**/*.{ts,tsx}',
  ],
};

export default config;
