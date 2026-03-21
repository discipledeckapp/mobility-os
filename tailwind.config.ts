import type { Config } from 'tailwindcss';

// Ready for shared brand-token wiring when the design-system theme is promoted.
// Example:
// import { mobirisBrand } from './packages/ui/brand/mobiris-brand';

const config: Config = {
  content: [
    './apps/*/src/**/*.{ts,tsx}',
    './packages/ui/*.{ts,tsx}',
    './packages/ui/brand/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
      },
      // Placeholder for future brand-token extensions from packages/ui/brand/mobiris-brand.ts
      // fontFamily: {
      //   sans: [mobirisBrand.typography.fontSans],
      // },
    },
  },
  plugins: [],
};

export default config;
