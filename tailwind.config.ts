// tailwind.config.ts
import type { Config } from "tailwindcss";
// Import 'fontFamily' from Tailwind's default theme to extend it
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  // Configure dark mode to be toggled by the 'dark' class on the HTML element
  darkMode: ["class"], // Using ["class"] as it's valid and often used, though "class" is also fine.

  // Specify files where Tailwind should look for classes to generate CSS
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // Include src if you have components/files there
  ],
  // Optional: Add a prefix to all Tailwind classes to prevent conflicts (e.g., 'tw-')
  prefix: "",

  // Define and extend Tailwind's default theme
  theme: {
    // Container settings for responsive centered content
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Extend font families to use the custom Inter font variable
      fontFamily: {
        // 'sans' will now use '--font-inter' first, then fall back to default sans-serif fonts
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      // Define custom colors using HSL CSS variables from globals.css
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sidebar: "hsl(var(--sidebar-background))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary:
        {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Extend border-radius with custom variable
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Keyframes for animations (used by tailwindcss-animate)
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      // Animation definitions (used by tailwindcss-animate)
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // Add Tailwind CSS plugins
  plugins: [
    require("tailwindcss-animate"), // For utility-first animations
    require("@tailwindcss/typography"), // For styling markdown content (the '.prose' class)
    // Note: '@tailwindcss/postcss' is typically handled by postcss.config.cjs
    // and doesn't usually go here directly unless it's a specific configuration.
    // However, if you are using it as a direct plugin, ensure its correct usage.
  ],
} satisfies Config; // Use 'satisfies Config' for better type inference

export default config;
