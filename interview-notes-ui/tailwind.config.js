/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F0E8',
        surface: '#FDFAF4',
        accent: {
          DEFAULT: '#8B5E3C',
          light: '#C4A882',
          dark: '#6B4423',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Source Serif 4', 'serif'],
      },
      maxWidth: {
        content: '860px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
