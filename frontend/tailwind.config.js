/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fortress: {
          950: '#030712',
          900: '#070d1e',
          850: '#0b142b',
          800: '#0f1c3f',
          700: '#1b2d5d',
        },
        cyber: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#8a2be2',
          neon: '#00ffcc',
          amber: '#f6ad55',
          rose: '#f43f5e',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-mesh': 'radial-gradient(at 0% 0%, rgba(0, 242, 254, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(138, 43, 226, 0.15) 0px, transparent 50%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
