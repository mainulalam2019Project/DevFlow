import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe7fe",
          200: "#bed3fe",
          300: "#91b4fd",
          400: "#608cf9",
          500: "#3b63f2",
          600: "#2846e6",
          700: "#2034cb",
          800: "#1f2fa5",
          900: "#1e2f82",
          950: "#171d4e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
