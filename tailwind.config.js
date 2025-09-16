/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sushi: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        'japanese': ['Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
        'float': 'float 20s linear infinite',
        'scale-in': 'scaleIn 0.3s ease-out',
        'sushi-move': 'sushiMove 10s linear forwards',
         'sushi-flow': 'sushi-flow 10s linear forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%': { 
            transform: 'translateX(100vw) translateY(0px) rotate(0deg)',
            opacity: '0'
          },
          '5%': { opacity: '0.8' },
          '95%': { opacity: '0.8' },
          '100%': { 
            transform: 'translateX(-150px) translateY(-10px) rotate(180deg)',
            opacity: '0'
          },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        sushiMove: {
          '0%': { left: '-200px' },
          '100%': { left: '110%' },
        },
         'sushi-flow': {
           '0%': { 
             transform: 'translateX(0)'
           },
           '100%': { 
             transform: 'translateX(100vw)'
           },
         }
      }
    },
  },
  plugins: [],
}
