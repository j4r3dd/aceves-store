/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#092536",
          background: "#eaf0f2",
          accent: "#759bbb",
        },
      },
    },
    plugins: [],
  };
  