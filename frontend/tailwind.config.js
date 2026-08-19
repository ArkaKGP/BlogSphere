/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fcf9f0',
          100: '#f7f0dc',
          200: '#eddab6',
          300: '#e4c489',
          400: '#d8b260',
          500: '#c9a84c',
          600: '#b8943f',
          700: '#947230',
          800: '#795a2b',
          900: '#644a27',
          950: '#392812',
        },
        brand: {
          50: '#fcf9f0',
          100: '#f7f0dc',
          200: '#eddab6',
          300: '#e4c489',
          400: '#d8b260',
          500: '#c9a84c',
          600: '#b8943f',
          700: '#947230',
          800: '#795a2b',
          900: '#644a27',
          950: '#392812',
        },
        obsidian: {
          950: '#070707',
          900: '#0c0c0d',
          850: '#121213',
          800: '#18181a',
          700: '#222225',
          600: '#2d2d32',
        },
        wheat: {
          DEFAULT: '#f5deb3',
          light: '#f7e7c4',
          dark: '#e0c592',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 10px 25px -5px rgba(201, 168, 76, 0.15)',
        'gold-glow': '0 0 25px -5px rgba(201, 168, 76, 0.3)',
      },
    },
  },
  plugins: [],
};
