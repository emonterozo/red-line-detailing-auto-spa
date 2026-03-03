/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary, #dc143c)",
        secondary: "var(--color-secondary, #111111)",
        background: "var(--color-background, #ffffff)",
        foreground: "var(--color-foreground, #171717)",
      },
      fontFamily: {
        poppins: "var(--font-poppins)",
        russo: "var(--font-russo-one)",
      },
    },
  },
  plugins: [],
};