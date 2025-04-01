'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white text-primary shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="Aceves logo" className="h-10 w-auto cursor-pointer" />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-sm font-medium tracking-wide">
          <li><Link href="/anillos" className="hover:text-accent transition-colors">Anillos</Link></li>
          <li><Link href="/collares" className="hover:text-accent transition-colors">Collares</Link></li>
          <li><Link href="/promociones" className="hover:text-accent transition-colors">Promociones</Link></li>
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
          <span className="text-lg hover:text-accent cursor-pointer">🛒</span>
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
            <ul className="flex flex-col gap-4 text-sm font-medium tracking-wide">
              <li><Link href="/anillos" className="hover:text-accent transition-colors">Anillos</Link></li>
              <li><Link href="/collares" className="hover:text-accent transition-colors">Collares</Link></li>
              <li><Link href="/promociones" className="hover:text-accent transition-colors">Promociones</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

