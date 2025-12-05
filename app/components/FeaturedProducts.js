'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function FeaturedProducts({ products = [] }) {
  if (!products.length) return null;

  return (
    <section className="mt-12 px-4">
      <h2 className="text-2xl font-bold text-[#092536] mb-6">✨ Productos Destacados</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/producto/${product.id}`} className="group">
            <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 group-hover:scale-[1.02]">
              <div className="h-40 sm:h-48 md:h-56 overflow-hidden rounded-lg mb-4 relative">
                <Image
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {product.envio_cruzado && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                    Envío cruzado disponible
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-[#092536] leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="text-[#092536] font-medium">${product.price} MXN</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
