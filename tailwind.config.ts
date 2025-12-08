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
        luxury: {
          charcoal: "#1a1a1a",
          navy: "#0f1419",
          amber: "#d4af37",
          gold: "#f5d76e",
          cream: "#f5f1e8",
          ivory: "#faf8f3",
          slate: "#2d3748",
          "gold-dark": "#b8941f",
          "amber-dark": "#a0822d",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "luxury-mesh": "radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)",
      },
      boxShadow: {
        luxury: "0 20px 60px rgba(0, 0, 0, 0.3)",
        gold: "0 8px 32px rgba(212, 175, 55, 0.15)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "gradient-shift": "gradientShift 20s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
