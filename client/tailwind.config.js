// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        julius: {
          teal: '#0A4D52',
          'teal-light': '#12666D',
          'teal-dark': '#06363A',
          gold: '#C5A059',
          'gold-light': '#D4AF37',
          'gold-dark': '#A37D35',
          cream: '#FBF9F5',
          sand: '#F4EFE6',
          charcoal: '#1A2426'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};