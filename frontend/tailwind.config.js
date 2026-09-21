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
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.2s ease-out forwards',
        'gradient': 'gradient 8s linear infinite',
      }
    },
  },
  plugins: [],
}
