/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/pages/**/*.{js,ts,jsx,tsx}',
    './src/renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da8ff',
          DEFAULT: '#2196f3',
          dark: '#0c7cd5',
        },
        secondary: {
          light: '#ffbb33',
          DEFAULT: '#ff9800',
          dark: '#cc7a00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
