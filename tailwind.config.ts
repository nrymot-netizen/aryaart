import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17151b",
        paper: "#fbfaf7",
        plum: "#6941c6",
        coral: "#ee6b5e",
        mist: "#f0edf7",
      },
      boxShadow: { card: "0 12px 36px rgba(36, 27, 53, 0.08)" },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [],
} satisfies Config;
