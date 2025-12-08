import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ink: "#05060a",
        "ink-soft": "#0f111b",
        "ink-muted": "#1b1d2a",
        sand: "#f7f4ea",
        "sand-muted": "#d5d2c3",
        amber: "#f5c063",
        saffron: "#f2994a",
        mint: "#95f5c3",
        teal: "#00c2a8",
        lava: "#ff6243",
      },
      fontFamily: {
        sans: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 40px rgba(242, 153, 74, 0.25)",
        subtle: "0 10px 45px rgba(5, 6, 10, 0.55)",
      },
      backgroundImage: {
        "grid-radial":
          "radial-gradient(circle at 20% 20%, rgba(149, 245, 195, 0.06), transparent 50%), radial-gradient(circle at 80% 0%, rgba(245, 192, 99, 0.07), transparent 45%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        "pulse-beam": {
          "0%": { opacity: "0.15", transform: "scale(0.95)" },
          "50%": { opacity: "0.4", transform: "scale(1.05)" },
          "100%": { opacity: "0.15", transform: "scale(0.95)" },
        },
        floaty: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
          "100%": { transform: "translateY(0px)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-beam": "pulse-beam 12s ease-in-out infinite",
        "floaty-slow": "floaty 16s ease-in-out infinite",
        ticker: "ticker 24s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
