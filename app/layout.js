// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from "react-toastify"; // ✅ Importa ToastContainer
import "react-toastify/dist/ReactToastify.css"; // ✅ Importa los estilos

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aceves Store",
  description: "Joyas para parejas – Anillos y collares",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <ToastContainer
              position="bottom-right" // ✅ Te recomiendo bottom-right
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
