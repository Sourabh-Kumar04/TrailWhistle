/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f8f4',
          100: '#e1efe4',
          200: '#c3dec9',
          300: '#97c4a3',
          400: '#67a477',
          500: '#468757',
          600: '#346c43',
          700: '#2b5637',
          800: '#25452f',
          900: '#1f3927',
          950: '#0d1f14',
        },
        earth: {
          50: '#faf7f2',
          100: '#f3ece1',
          200: '#e6d8c3',
          300: '#d5bea0',
          400: '#c19f7a',
          500: '#b0865e',
          600: '#9b704f',
          700: '#7e5740',
          800: '#674738',
          900: '#563c31',
          950: '#301f19',
        },
        feather: {
          accent: '#d97706',
          yellow: '#f59e0b',
          sky: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
