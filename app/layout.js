import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../context/CartContext"; // ✅ import CartProvider

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
        <CartProvider> {/* ✅ wrap everything */}
          <Navbar />   {/* ✅ still renders globally */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
