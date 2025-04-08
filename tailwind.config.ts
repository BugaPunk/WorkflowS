import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components,layouts}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
          },
        },
      },
    },
  },
} satisfies Config;
