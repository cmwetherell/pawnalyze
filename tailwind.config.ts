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
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: "#05060a",
        "ink-soft": "#0c0f1d",
        paper: "#f4efe4",
        brass: "#f6c177",
        mint: "#72f5c7",
        ember: "#ff6b6b",
        slate: "#9ea8c7",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        glow: "0 0 40px rgba(114, 245, 199, 0.35)",
        card: "0 25px 80px rgba(0, 0, 0, 0.55)",
      },
      keyframes: {
        "slow-pulse": {
          "0%, 100%": { opacity: "0.25" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "slide-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "pulse-slow": "slow-pulse 12s ease-in-out infinite",
        float: "float 14s ease-in-out infinite",
        "gradient-pan": "slide-pan 24s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
