/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 900: 'var(--b900)', 700: 'var(--b700)', 500: 'var(--b500)', 300: 'var(--b300)', 100: 'var(--b100)', 50: 'var(--b50)' },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        nav: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
