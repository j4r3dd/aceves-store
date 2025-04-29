import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import PageWrapper from '../components/PageWrapper'; 

export default async function AnillosPage() {
  const supabase = createServerComponentClient({ cookies });

  let products = [];
  let error = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'anillos');

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    products = data || [];
    console.log(`Found ${products.length} anillos products in Supabase`);

    if (products.length === 0) {
      throw new Error('No products found in Supabase');
    }
  } catch (err) {
    console.error('Error fetching from Supabase:', err);
    error = err;

    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const allProducts = JSON.parse(jsonData);
      products = allProducts.filter(p => p.category === 'anillos');
      console.log(`Found ${products.length} anillos products in local JSON`);
    } catch (fileErr) {
      console.error('Error reading fallback file:', fileErr);
    }
  }

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold text-primary mb-6">Anillos</h1>

      {error && products.length === 0 ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading products: {error.message}</p>
          <p className="text-sm mt-2">
            Please check your Supabase connection and ensure the 'products' table exists.
          </p>
        </div>
      ) : (
        <>
          <img
            src="https://hnaptwk79kknvilx.public.blob.vercel-storage.com/banners/banner_Anillo_mano-TO0508YUiYZrBxIAy0mgQ8yWX50QtW.jpg"
            alt="Banner de Anillos"
            className="w-full rounded-xl mb-8"
          />

          {products.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg text-gray-600">No hay anillos disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
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
                    <h2 className="text-base font-semibold text-[#092536] leading-tight line-clamp-2">
                      {product.name}
                    </h2>

                    <p className="text-[#092536] font-medium">${product.price} MXN</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
