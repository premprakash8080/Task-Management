/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange': '#ff6b6b',
        'green': {
          600: '#38a169'
        }
      }
    },
  },
  plugins: [],
} 