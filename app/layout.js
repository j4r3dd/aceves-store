// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { headers } from 'next/headers';
import { OrganizationSchema } from "./components/OrganizationSchema"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Aceves Joyería | Anillos y Collares con Alma",
    template: "%s | Aceves Joyería"
  },
  description: "Joyería artesanal mexicana con alma para momentos que importan. Anillos y collares diseñados para capturar momentos importantes entre parejas.",
  keywords: ["joyería mexicana", "anillos parejas", "collares artesanales", "anillos de promesa", "regalos románticos", "joyería personalizada"],
  openGraph: {
    title: "Aceves Joyería | Anillos y Collares con Alma",
    description: "Joyería artesanal mexicana con alma para momentos que importan.",
    siteName: "Aceves Joyería",
    locale: "es-MX",
    type: "website",
  }
};

export default async function RootLayout({ children }) {
  // Use this for canonical URL, but only on the client side
  const headersList = await headers();
  const path = headersList.get('x-pathname') || '';
  const canonicalUrl = `https://aceves-store.com${path}`;

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
        <OrganizationSchema />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <ToastContainer
              position="bottom-right"
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