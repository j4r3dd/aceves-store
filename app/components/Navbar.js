'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="w-full bg-white text-primary shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* Logo */}
        <Link href="/">
          <img src="/logo.png" alt="Aceves logo" className="h-10 w-auto cursor-pointer" />
        </Link>

        {/* Menu Items */}
        <ul className="hidden md:flex gap-6 text-sm font-medium tracking-wide">
          <li>
            <Link href="/anillos" className="hover:text-accent transition-colors">
              Anillos
            </Link>
          </li>
          <li>
            <Link href="/collares" className="hover:text-accent transition-colors">
              Collares
            </Link>
          </li>
          <li>
            <Link href="/promociones" className="hover:text-accent transition-colors">
              Promociones
            </Link>
          </li>
        </ul>

        {/* Icons + Search */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Buscar"
            className="hidden md:block border border-gray-300 rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span className="text-lg hover:text-accent cursor-pointer">🛒</span>
          <span className="text-lg hover:text-accent cursor-pointer">👤</span>
        </div>

      </nav>
    </header>
  );
}


