/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        space: {
          900: '#0b1120',
          800: '#1e293b',
          accent: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
};
