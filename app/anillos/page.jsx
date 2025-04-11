// app/anillos/page.jsx
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Create Supabase server client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function AnillosPage() {
  // Fetch products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', 'anillos');

  if (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <img
        src="/Banner anillos.png"
        alt="Banner de Anillos"
        className="w-full rounded-xl mb-8"
      />

      <h1 className="text-3xl font-bold text-primary mb-6">Anillos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((product) => (
          <Link key={product.id} href={`/producto/${product.id}`} className="group">
            <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 ease-in-out cursor-pointer group-hover:scale-[1.02]">
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background">
                <img
                  src={product.images?.[0]}
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