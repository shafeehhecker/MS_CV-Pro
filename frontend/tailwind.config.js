/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f4f2',
          100: '#e8e7e4',
          200: '#ccc9c3',
          300: '#a8a49b',
          400: '#7d7870',
          500: '#5a554f',
          600: '#433f3a',
          700: '#302d29',
          800: '#1e1c19',
          900: '#0f0e0d',
        },
        brand: {
          50:  '#f0f7ff',
          100: '#dbeeff',
          200: '#b8deff',
          300: '#82c4ff',
          400: '#45a3ff',
          500: '#1a82ff',
          600: '#0062e6',
          700: '#004cba',
          800: '#003d96',
          900: '#00307a',
        },
        score: {
          low:  '#ef4444',
          mid:  '#f59e0b',
          good: '#10b981',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
        'pulse-score': 'pulseScore 2s ease infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseScore: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.7 } }
      }
    }
  },
  plugins: []
}
