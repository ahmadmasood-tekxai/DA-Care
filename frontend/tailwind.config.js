/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — always reference these tokens, never raw hex values.
        cream: { DEFAULT: '#fdf8f5', 2: '#f5ede8', 3: '#efe3dc' },
        navy: { DEFAULT: '#0d0a0a', soft: '#3a2e2e', 2: '#1a1212', 3: '#241a1a' },
        pink: { DEFAULT: '#a08080', deep: '#7a4f4f', pale: '#f0e8e8' },
        gold: '#C9A84C',
        'gold-light': '#E8C96D',
        'gold-dark': '#a07830',
        sale: '#c2410c',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem', '5xl': '2.5rem' },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progress: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'ken-burns': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.06)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(4%, -6%, 0) scale(1.08)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'ken-burns': 'ken-burns 7s ease-out both',
        drift: 'drift 18s ease-in-out infinite',
        progress: 'progress 6s linear both',
        shimmer: 'shimmer 1.6s infinite',
        marquee: 'marquee 40s linear infinite',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(13,10,10,0.06)',
        card: '0 12px 40px -12px rgba(13,10,10,0.18)',
        lift: '0 24px 60px -20px rgba(13,10,10,0.35)',
        gold: '0 8px 32px rgba(201,168,76,0.25)',
        'gold-sm': '0 4px 16px rgba(201,168,76,0.2)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
