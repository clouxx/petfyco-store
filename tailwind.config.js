/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CB5F9',
        navy: '#2D2D2D',
        accent: '#56C4F2',
        'petfy-orange': '#FF9800',
        'petfy-pink': '#E91E63',
        'petfy-bg': '#F5F5F7',
        'petfy-grey': '#F3F6F9',
        'petfy-grey-text': '#757575',
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
