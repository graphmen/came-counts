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
        card: "0 1px 3px rgba(43, 27, 16, 0.04), 0 4px 12px rgba(43, 27, 16, 0.03)",
      },
      colors: {
        wez: {
          green: "#1f3a1c",
          "green-mid": "#3f6b24",
          "green-light": "#5a8a3a",
          mint: "#eef4e8",
          "green-soft": "#f4f8f0",
          sunset: "#c46a14",
          "sunset-mid": "#e08a30",
          "sunset-soft": "#fdf6eb",
          earth: "#2b1b10",
          stone: "#f8f4ec",
          "stone-100": "#f0e9dc",
          "stone-200": "#e2d8c8",
          ink: "#1c1a14",
          muted: "#6b6458",
          faint: "#9a9186",
          gold: "#c46a14",
          savanna: "#e08a30",
          background: "#f8f4ec",
          foreground: "#1c1a14",
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
