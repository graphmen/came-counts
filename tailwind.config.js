/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(26, 36, 32, 0.04), 0 4px 12px rgba(26, 36, 32, 0.03)",
      },
      colors: {
        wez: {
          green: "#0f4c3a",
          "green-mid": "#1a6b52",
          "green-light": "#2d8a6a",
          mint: "#e8f5f0",
          "green-soft": "#f0faf6",
          stone: "#f7f6f3",
          "stone-100": "#efeee9",
          "stone-200": "#e2e0d8",
          ink: "#1a2420",
          muted: "#5c6b64",
          faint: "#8a968f",
          gold: "#b45309",
          earth: "#78350f",
          savanna: "#d97706",
          background: "#f7f6f3",
          foreground: "#1a2420",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
