/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: Object.fromEntries([900, 700, 500, 300, 100, 50].map((n) => [n, `rgb(var(--b${n}) / <alpha-value>)`])),
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
