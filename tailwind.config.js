/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Web3 dark palette
        surface: {
          0: '#07080c',
          1: '#0d0f15',
          2: '#13161e',
          3: '#1a1e29',
          4: '#212636',
        },
        border: {
          DEFAULT: '#252a38',
          subtle: '#1c2030',
        },
        neon: {
          green: '#00e676',
          cyan: '#00e5ff',
          purple: '#b388ff',
          pink: '#f48fb1',
        },
        profit: '#00e676',
        loss: '#ff5252',
        warn: '#ffab40',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 20px rgba(0, 230, 118, 0.15)',
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.15)',
        card: '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      keyframes: {
        pulse_dot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
        slide_in: {
          from: { transform: 'translateY(8px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        pulse_dot: 'pulse_dot 1.4s ease-in-out infinite',
        slide_in: 'slide_in 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
