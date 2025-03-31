import Link from 'next/link';
import { products } from '@/data/products';

export default function AnillosPage() {
  const anillos = products.filter(p => p.category === 'anillos');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Anillos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {anillos.map((product) => (
          <Link key={product.id} href={`/producto/${product.id}`}>
            <div className="bg-white text-black border rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
              <img src={product.image} alt={product.name} className="w-full h-48 object-contain rounded" />
              <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">${product.price} MXN</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

