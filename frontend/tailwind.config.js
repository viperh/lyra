/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        lyra: {
          bg: '#0a0a0f',
          panel: '#0d1117',
          border: '#1a2332',
          accent: '#00ff9f',
          'accent-dim': '#00cc7f',
          accent2: '#00b8ff',
          accent3: '#ff006e',
          text: '#c9d1d9',
          'text-dim': '#6e7681',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 10px rgba(0, 255, 159, 0.3)',
        'glow-strong': '0 0 20px rgba(0, 255, 159, 0.5)',
        'glow-blue': '0 0 10px rgba(0, 184, 255, 0.3)',
      },
      animation: {
        'scan': 'scan 4s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
