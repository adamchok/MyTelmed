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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        xl2: "1120px",
      },
    },
  },
  important: true, // Make all Tailwind utilities use !important by default
  corePlugins: {
    preflight: false, // Disable base styles that might conflict with Ant Design
  },
  plugins: [],
};

export default config;
