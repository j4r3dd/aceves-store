/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",        // 👈 Scans pages
      "./components/**/*.{js,ts,jsx,tsx}", // 👈 Scans your components
    ],
    theme: {
      extend: {
        colors: {
          primary: "#092536",      // Navy
          background: "#eaf0f2",   // Light blue-gray
          accent: "#749bbb",       // Soft blue
        },
        keyframes:{
            slideDown:{
                '0%': { opacity: 0, transform: 'translateY(-10%)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
            }
        }
        
      },
    },
    plugins: [],
  };
  
  