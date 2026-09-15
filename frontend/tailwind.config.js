/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#f5f0ed', 2: '#f0ebe8' },
        navy: { DEFAULT: '#000000', soft: '#333333' },
        pink: { DEFAULT: '#988686', deep: '#5C4E4E', pale: '#D1D0D0' },
        gold: '#D1D0D0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: { '4xl': '28px' },
    },
  },
  plugins: [],
}
