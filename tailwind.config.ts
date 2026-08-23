import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4064D7',
          dark: '#2E4FBF',
          light: '#EEF2FF',
          50: '#EEF2FF',
          100: '#D4DCFA',
          500: '#4064D7',
          600: '#3554C7',
          700: '#2E4FBF',
          900: '#1a2b6b',
        },
        accent: {
          DEFAULT: '#FFA600',
          dark: '#E69500',
          light: '#FFF8E6',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'primary': '0 8px 32px rgba(64, 100, 215, 0.25)',
        'primary-lg': '0 16px 48px rgba(64, 100, 215, 0.3)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
