import Link from 'next/link';
import { products } from '../data/products'; 

export default function AnillosPage() {
  const anillos = products.filter(p => p.category === 'anillos');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <img
        src="/Banner anillos.png"
        alt="Banner de Anillos"
        className="w-full rounded-xl mb-8"
      />

      <h1 className="text-3xl font-bold text-primary mb-6">Anillos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {anillos.map((product) => (
          <Link key={product.id} href={`/producto/${product.id}`} className="group">
            <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 ease-in-out cursor-pointer group-hover:scale-[1.02]">
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h2 className="text-lg font-semibold text-primary">{product.name}</h2>
              <p className="text-accent font-medium">${product.price} MXN</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
