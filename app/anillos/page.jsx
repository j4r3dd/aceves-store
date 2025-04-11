import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AnillosPage() {
  // Create Supabase server client
  const supabase = createServerComponentClient({ cookies });
  
  // Try fetching from Supabase first
  let products = [];
  let error = null;
  
  try {
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'anillos');
    
    if (supabaseError) throw supabaseError;
    products = data || [];
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
    error = err;
    
    // Fallback to local JSON file
    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const allProducts = JSON.parse(jsonData);
      products = allProducts.filter(p => p.category === 'anillos');
    } catch (fileErr) {
      console.error('Error reading fallback file:', fileErr);
    }
  }

  if (error && products.length === 0) {
    return <div>Error loading products: {error.message}</div>;
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