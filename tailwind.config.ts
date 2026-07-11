import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8ecf4',
          100: '#c5cee3',
          200: '#9eaed0',
          300: '#778ebd',
          400: '#5976ae',
          500: '#3b5e9f',
          600: '#345697',
          700: '#2b4c8d',
          800: '#224283',
          900: '#132452',
          950: '#0a1330',
        },
        orange: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#ffcda8',
          300: '#ffab71',
          400: '#fa8c41',
          500: '#f87118',
          600: '#e9560e',
          700: '#c1400e',
          800: '#993414',
          900: '#7b2d14',
          950: '#421408',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(19, 36, 82, 0.08), 0 4px 12px rgba(19, 36, 82, 0.04)',
        'card-hover': '0 4px 16px rgba(19, 36, 82, 0.12), 0 8px 32px rgba(19, 36, 82, 0.06)',
        'glow-orange': '0 0 20px rgba(250, 140, 65, 0.3), 0 0 40px rgba(250, 140, 65, 0.1)',
        'glow-navy': '0 0 20px rgba(19, 36, 82, 0.2), 0 0 40px rgba(19, 36, 82, 0.1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-up-delay-1': 'fade-up 0.5s ease-out 0.1s forwards',
        'fade-up-delay-2': 'fade-up 0.5s ease-out 0.2s forwards',
        'fade-up-delay-3': 'fade-up 0.5s ease-out 0.3s forwards',
        'fade-up-delay-4': 'fade-up 0.5s ease-out 0.4s forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
export default config
