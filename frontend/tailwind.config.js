/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: '#fdf8f5', 2: '#f5ede8' },
        navy: { DEFAULT: '#0d0a0a', soft: '#3a2e2e' },
        pink: { DEFAULT: '#a08080', deep: '#7a4f4f', pale: '#f0e8e8' },
        gold: '#C9A84C',
        'gold-light': '#E8C96D',
        'gold-dark': '#a07830',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(201,168,76,0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'gradient': 'gradient 8s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E8C96D 50%, #C9A84C 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0d0a0a 0%, #1a0f0f 50%, #0d0a0a 100%)',
        'hero-radial': 'radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, rgba(122,79,79,0.1) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold': '0 8px 32px rgba(201,168,76,0.25)',
        'gold-sm': '0 4px 16px rgba(201,168,76,0.2)',
        'dark-xl': '0 24px 64px rgba(13,10,10,0.4)',
        'inner-gold': 'inset 0 1px 0 rgba(201,168,76,0.3)',
      },
    },
  },
  plugins: [],
}
