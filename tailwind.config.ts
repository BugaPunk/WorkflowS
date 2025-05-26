import type { Config } from "tailwindcss";

export default {
  content: ["{routes,islands,components,layouts}/**/*.{ts,tsx,js,jsx}"],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      sans: ['"Ubuntu Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      serif: ["ui-serif", "Georgia", "serif"],
      mono: ["ui-monospace", "SFMono-Regular", "monospace"],
    },
    extend: {
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            fontFamily: '"Ubuntu Sans", ui-sans-serif, system-ui, sans-serif',
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
} satisfies Config;
