/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        japan: {
          red: '#BC002D',        // Classic Hinomaru Crimson
          sakura: '#FFB7C5',     // Cherry blossom pink
          sakuraLight: '#FFF0F5',
          dark: '#111827',
          card: '#1F2937',
          gold: '#D4AF37',
          matcha: '#4A7C59',
          fuji: '#3A6B88'
        }
      },
      fontFamily: {
        hebrew: ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
