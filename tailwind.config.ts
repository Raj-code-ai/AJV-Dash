import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9dffd",
          300: "#7cc5fc",
          400: "#36a7f8",
          500: "#0c8ce9",
          600: "#006fc7",
          700: "#0158a1",
          800: "#064b85",
          900: "#0b3f6e",
          950: "#072849",
        },
        academic: {
          navy: "#0b1f3a",
          ink: "#12263f",
          slate: "#1e3a5f",
          gold: "#c9a227",
          teal: "#0d9488",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(11, 31, 58, 0.18)",
        glass: "0 8px 32px rgba(11, 31, 58, 0.12)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #0b1f3a 0%, #0158a1 45%, #0d9488 100%)",
        "page-light":
          "radial-gradient(ellipse at top, #e0effe 0%, #f8fafc 45%, #f1f5f9 100%)",
        "page-dark":
          "radial-gradient(ellipse at top, #0b1f3a 0%, #0a1628 50%, #020617 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
