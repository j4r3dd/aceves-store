/** @type {import('tailwindcss').Config} */
const aspectRatio = require('@tailwindcss/aspect-ratio');

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#092536",      // Deep navy
        background: "#eaf0f2",   // Light ice blue
        accent: "#759bbb",       // Soft blue
      },
      keyframes: {
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-10%)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        slideDown: "slideDown 0.8s ease-out",
      },
    },
  },
  plugins: [aspectRatio],
};
