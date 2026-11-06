import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'acces-blue': '#003049',
        'acces-red': '#C1121F',
        'acces-beige': '#F5F1E8',
        'acces-black': '#1A1A1A'
      }
    }
  },
  plugins: []
} satisfies Config;
