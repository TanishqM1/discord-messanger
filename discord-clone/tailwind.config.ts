import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-gray': '#dfe1e4',
        discord: '#7289da',
        'medium-gray': '#f0f1f3',
        'dark-discord': '#4572c4',
        'light-gray': '#e8eaec',
        'hover-gray': '#cdcfd3',
        'composer-gray': 'hsl(210 calc( 1 * 11.1%) 92.9% / 1);',
        'gray-normal': '#313338',
      },
    },
  },
  plugins: [],
} satisfies Config;
