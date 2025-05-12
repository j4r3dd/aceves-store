'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart } = useCart(); // 👈 get cart

  return (
    <header className="w-full bg-white text-[#092536] shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link href="/">
          <img src="https://hnaptwk79kknvilx.public.blob.vercel-storage.com/logo/logo%20principal%20%281%29-R8ZSkLmTZwcRUnBkL6NFtSnwc3Huie.png" alt="Aceves logo" className="h-20 w-auto cursor-pointer" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-base font-medium tracking-wide">
          <li><Link href="/anillos" className="hover:text-[#759bbb] transition-colors">Anillos de Promesa</Link></li>
          <li><Link href="/collares" className="hover:text-[#759bbb] transition-colors">Collares</Link></li>
          <li><Link href="/promociones" className="hover:text-[#759bbb] transition-colors">Promociones</Link></li>
        </ul>

        {/* Icons + Hamburger */}
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl">
            {isOpen ? '✕' : '☰'}
          </button>
          <input
            type="text"
            placeholder="Buscar"
            className="hidden md:block border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {/* 🛒 Cart icon with badge */}
          <Link href="/cart" className="relative hover:text-accent">
            <div className="relative cursor-pointer">
              <span className="text-lg">🛒</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </Link>



          {/* 👤 Account icon */}
          <span className="text-lg hover:text-accent cursor-pointer">👤</span>
        </div>
      </nav>

      {/* Mobile Menu w/ Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="md:hidden px-6 pb-4"
          >
            <ul className="flex flex-col gap-4 text-base font-medium tracking-wide">
              <li><Link href="/anillos" className="hover:text-[#092536] transition-colors">Anillos de Promesa</Link></li>
              <li><Link href="/collares" className="hover:text-[#092536] transition-colors">Collares</Link></li>
              <li><Link href="/promociones" className="hover:text-[#092536] transition-colors">Promociones</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
