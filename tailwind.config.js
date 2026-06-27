/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          bg: 'var(--color-bg, #F5EDD6)',
          text: 'var(--color-text, #2C1810)',
          gold: 'var(--color-gold, #B8960C)',
          rose: 'var(--color-rose, #8B3A52)',
          card: 'var(--color-card, #FDF6E3)',
          border: 'var(--color-border, #C9A84C)',
        }
      },
      fontFamily: {
        playfair: ['var(--font-english, "Playfair Display")', 'serif'],
        lora: ['var(--font-english, Lora)', 'serif'],
        arabic: ['var(--font-arabic, "Noto Naskh Arabic")', 'serif'],
      },
      boxShadow: {
        'paper-curl': '0 15px 10px -10px rgba(44, 24, 16, 0.3), 0 1px 4px rgba(44, 24, 16, 0.1)',
        'vintage': '0 4px 20px rgba(44, 24, 16, 0.15)',
        'wax-seal': 'inset 0 2px 4px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.5)',
      }
    },
  },
  plugins: [],
}
