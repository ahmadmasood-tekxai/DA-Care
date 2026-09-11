/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#FFF9F4', 2: '#FFF1E7' },
        navy: { DEFAULT: '#22304F', soft: '#4A5A80' },
        pink: { DEFAULT: '#F3A0BF', deep: '#E97FA6', pale: '#FCE2EC' },
        gold: '#E7B84F',
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: { '4xl': '28px' },
    },
  },
  plugins: [],
}
