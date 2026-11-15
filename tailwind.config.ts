import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        megh: {
          primary: '#1B4FD8',
          accent: '#9CCB3B',
          navy: '#0B1B3F',
          surface: '#F6F8FC',
          blue: '#1B4FD8',
          green: '#9CCB3B',
        },
        brand: {
          blue: '#1B4FD8',
          green: '#9CCB3B',
          navy: '#0B1B3F',
          surface: '#F6F8FC',
        },
        primary: {
          DEFAULT: '#1B4FD8',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#9CCB3B',
          foreground: '#0B1B3F',
        },
        navy: {
          DEFAULT: '#0B1B3F',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B1B3F',
        },
        border: 'hsl(var(--border, 220 13% 91%))',
        input: 'hsl(var(--input, 220 13% 91%))',
        ring: '#1B4FD8',
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'var(--font-montserrat)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        montserrat: [
          'var(--font-montserrat)',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
