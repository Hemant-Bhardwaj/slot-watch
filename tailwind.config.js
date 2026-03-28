/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          400: '#c8ff00',
          500: '#b0e000',
          600: '#90b800',
        },
        dark: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#161616',
          600: '#1c1c1c',
          500: '#222222',
          400: '#2a2a2a',
          300: '#333333',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
