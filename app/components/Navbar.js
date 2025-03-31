import Link from 'next/link';

export default function Navbar() {
    return (
      <header className="w-full bg-white text-black shadow-md">
        <nav className="max-w-7xl mx-auto flex justify-between items-center p-4">
          {/* Logo */}
          <img src="/logo.png" alt="Aceves logo" className="h-10 w-auto" />

  
          {/* Menu Items */}
          <ul className="hidden md:flex gap-6 text-sm font-medium">
          <li><Link href="/anillos">Anillos</Link></li>
          <li><Link href="/collares">Collares</Link></li>
          <li><Link href="/promociones">Promociones</Link></li> {/* Optional */}
          </ul>
  
          {/* Search + Icons */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Buscar"
              className="border border-gray-300 rounded-full px-3 py-1 text-sm hidden md:block"
            />
            <span className="text-lg">🛒</span>
            <span className="text-lg">👤</span>
          </div>
        </nav>
      </header>
    );
  }
  