import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        ink: {
          DEFAULT: '#0F172A',
          soft: '#1E293B',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      letterSpacing: {
        tight: '-0.02em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        card: '0 2px 8px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
