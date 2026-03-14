/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D7A2D',     /* verde oscuro del logo */
        accent:  '#E8811F',     /* naranja del logo */
        navy:    '#1A3D1A',     /* verde muy oscuro para textos */
        'petfy-green-light': '#7EC87E',  /* verde suave del logo */
        'petfy-orange': '#E8811F',
        'petfy-bg': '#F5F8F5',
        'petfy-grey': '#F3F6F3',
        'petfy-grey-text': '#6B7B6B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
