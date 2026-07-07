/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Custom palette -- deliberately not Twitch's purple (#9146FF).
        // StreamVerse uses a deeper violet with a near-black base instead of
        // Twitch's charcoal, so the UI reads as its own product.
        surface: {
          950: '#07060c',
          900: '#0d0b16',
          800: '#141220',
          700: '#1c192b',
          600: '#28243b',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          glow: '#c4b5fd',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(139, 92, 246, 0.45)',
        card: '0 8px 30px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        pulseLive: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
      },
      animation: {
        pulseLive: 'pulseLive 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
