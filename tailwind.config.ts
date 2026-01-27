import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crust: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#ebe0cf",
          300: "#dcc9ad",
          400: "#c9a97f",
          500: "#b98f5e",
          600: "#a97849",
          700: "#8c5f3c",
          800: "#734e36",
          900: "#5e412f",
          950: "#352218",
        },
        flour: {
          50: "#fefefe",
          100: "#fcfcfb",
          200: "#f9f8f5",
          300: "#f3f1ec",
          400: "#e8e4db",
          500: "#d9d3c6",
        },
      },
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
