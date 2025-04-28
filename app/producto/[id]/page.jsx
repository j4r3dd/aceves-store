// app/producto/[id]/page.jsx

import ProductoView from '../ProductoView';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies });

  const { data: products, error } = await supabase
    .from('products')
    .select('id');

  if (error) {
    console.error('Error fetching product IDs from Supabase:', error);
    return [];
  }

  return products.map((product) => ({
    id: product.id.toString(), // ensure it's a string for dynamic routing
  }));
}

export default async function ProductoPage({ params }) {
  const supabase = createServerComponentClient({ cookies });
  const { id } = params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    return <div className="p-6">Producto no encontrado.</div>;
  }

  return <ProductoView product={product} />;
}
