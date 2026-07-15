import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        'pub-display': ['var(--font-space-grotesk)', 'sans-serif'],
        'pub-mono': ['var(--font-fira-code)', 'monospace'],
      },
      colors: {
        pub: {
          bg: 'rgb(var(--pub-bg) / <alpha-value>)',
          surface: 'rgb(var(--pub-surface) / <alpha-value>)',
          accent: 'rgb(var(--pub-accent) / <alpha-value>)',
          'text-main': 'rgb(var(--pub-text-main) / <alpha-value>)',
          'text-muted': 'rgb(var(--pub-text-muted) / <alpha-value>)',
          success: 'rgb(var(--pub-success) / <alpha-value>)',
          warning: 'rgb(var(--pub-warning) / <alpha-value>)',
          error: 'rgb(var(--pub-error) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
};
export default config;
