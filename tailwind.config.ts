import type { Config } from "tailwindcss";

/**
 * Tailwind CSS v4 is configured primarily through `src/app/globals.css`
 * (`@import "tailwindcss"` + `@theme`). This file is kept minimal for tooling
 * that still expects a config module.
 */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
