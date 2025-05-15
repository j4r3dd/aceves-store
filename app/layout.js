// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { headers } from 'next/headers';
import OrganizationSchema from "./components/OrganizationSchema";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  icons: {
    icon: '/favicon.ico', // or whatever your favicon filename is
    apple: '/apple-icon.png', // optional
  },

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
  const canonicalUrl = `https://www.acevesoficial.com/${path}`;

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
        <OrganizationSchema />
        
        {/* TikTok Pixel Code */}
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('D0J3DIJC77U10T5VC50G');
                ttq.page();
              }(window, document, 'ttq');
            `
          }}
        />
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