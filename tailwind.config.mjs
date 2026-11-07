/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
        },
        line: '#E5E1D8',
        republic: {
          900: '#002654',
          700: '#1E3A8A',
          100: '#DBE4F3',
        },
        marianne: {
          DEFAULT: '#CE1126',
          light: '#FEE2E2',
        },
        gold: {
          DEFAULT: '#E8B21A',
          hover: '#D49E10',
          light: '#FEF3C7',
          dark: '#78350F',
        },
        velvet: {
          DEFAULT: '#8B1E2D',
          light: '#FCE7EA',
        },
        night: '#0B1B3A',
        success: {
          DEFAULT: '#146C32',
          light: '#DCFCE7',
        },
        error: {
          DEFAULT: '#B91C1C',
          light: '#FEE2E2',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Atkinson Hyperlegible', 'Luciole', 'system-ui', '-apple-system', 'sans-serif'],
        diploma: ['Cinzel', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.04)',
        elevated: '0 12px 28px -6px rgba(11, 27, 58, 0.14), 0 4px 10px -2px rgba(11, 27, 58, 0.06)',
      },
    },
  },
  plugins: [],
};

