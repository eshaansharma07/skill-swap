import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: "#FBFBFD",
          dark: "#000000",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1C1C1E",
          elevated: {
            light: "#FFFFFF",
            dark: "#2C2C2E",
          },
        },
        foreground: {
          light: "#1D1D1F",
          dark: "#F5F5F7",
        },
        muted: {
          light: "#6E6E73",
          dark: "#86868B",
        },
        apple: {
          blue: "#0071E3",
          blueDark: "#2997FF",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          indigo: "#5856D6",
          gray: "#8E8E93",
          lightGray: "#F2F2F7",
          darkGray: "#2C2C2E",
        },
        border: {
          light: "rgba(0, 0, 0, 0.08)",
          dark: "rgba(255, 255, 255, 0.12)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "apple-sm": "10px",
        "apple-md": "14px",
        "apple-lg": "18px",
        "apple-xl": "24px",
      },
      boxShadow: {
        apple: "0 4px 24px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "apple-elevated": "0 12px 36px -4px rgba(0, 0, 0, 0.10), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
        "apple-sheet": "0 -8px 30px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
