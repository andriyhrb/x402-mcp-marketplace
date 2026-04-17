import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Geist', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0a0a0e',
          1: '#101017',
          2: '#171722',
          3: '#22222f',
        },
        line: {
          DEFAULT: '#2a2a38',
          soft: '#1d1d28',
        },
        bone: {
          DEFAULT: '#f4ece0',
          dim: '#c9c3b7',
        },
        muted: '#7f7e8d',
        lime: {
          DEFAULT: '#d4ff3a',
          ink: '#0a0a0e',
        },
        coral: '#ff5a36',
        violet: '#a78bfa',
        mint: '#7ef0c9',
      },
      letterSpacing: {
        tightest: '-0.05em',
      },
    },
  },
  plugins: [],
};

export default config;
