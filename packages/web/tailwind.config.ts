import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Verde institucional — #2e7d32
        primary: {
          50:  '#f0fdf1',
          100: '#dcfce8',
          200: '#b9f7d1',
          300: '#85efad',
          400: '#4ade80',
          500: '#22c55e',
          600: '#2e7d32',
          700: '#276b2b',
          800: '#1e5521',
          900: '#143d17',
        },
        // Laranja institucional — #d37a15
        accent: {
          50:  '#fff8f0',
          100: '#fef0d4',
          200: '#fcd9a1',
          300: '#f9bb63',
          400: '#f59830',
          500: '#d37a15',
          600: '#b8650f',
          700: '#9a530b',
          800: '#7d4209',
          900: '#5c3007',
        },
      },
    },
  },
  plugins: [],
}

export default config
