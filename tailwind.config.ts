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
        ebony: "#1a1a1f",
        charcoal: "#2d2d35",
        slate: "#3a3a45",
        gold: "#d4af37",
        "gold-light": "#e8d5a3",
        "gold-dark": "#b8941f",
        ivory: "#f8f6f0",
        cream: "#f5f1e8",
        paper: "#faf9f5",
        ink: "#0a0a0d",
        silver: "#c0c0c0",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Crimson Pro", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-luxury": "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)",
        "gradient-dark": "linear-gradient(180deg, #1a1a1f 0%, #2d2d35 100%)",
      },
      boxShadow: {
        elegant: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)",
        soft: "0 10px 40px rgba(0, 0, 0, 0.15)",
        glow: "0 0 30px rgba(212, 175, 55, 0.2)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "fade-in": "fadeIn 0.6s ease-in-out forwards",
        "slide-in-right": "slideInRight 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionTimingFunction: {
        elegant: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
