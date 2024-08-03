import { url } from "inspector";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "hero-pattern": "url('/heroImg.jpg')",
      },
      colors: {
        "primary-dark": "#003DF5",
        "primary-medium": "#8FA3FF",
        "primary-light": "#EBF0FF",
        error: "#FF3939",
        warning: "#FFB800",
        success: "#00C48C",
        "neutral-600": "#000000",
        "neutral-500": "#333333",
        "neutral-400": "#737373",
        "neutral-300": "#D9D9D9",
        "neutral-200": "#FAFAFA",
        "neutral-100": "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;
