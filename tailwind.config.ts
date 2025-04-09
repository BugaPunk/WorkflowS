import type { Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components,layouts}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['"Ubuntu Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            fontFamily: '"Ubuntu Sans", ui-sans-serif, system-ui, sans-serif',
          },
        },
      },
    },
  },
} satisfies Config;
