// app/producto/[id]/page.jsx
import ProductoView from '../ProductoView';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Script from 'next/script';

export async function generateMetadata({ params }) {
  // We need to use this pattern for cookies in Next.js 13+
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Need to await params.id since it's now async
  const id = await params.id;
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (!product) {
    return {
      title: 'Producto no encontrado | Aceves Joyería',
      description: 'Lo sentimos, no pudimos encontrar el producto que estás buscando.'
    };
  }
  
  const cleanDescription = product.description
    ? product.description.substring(0, 157) + '...'
    : 'Joyería artesanal con alma para momentos que importan. Descubre nuestra colección única.';
    
  return {
    title: `${product.name} | Aceves Joyería`,
    description: cleanDescription,
    keywords: [product.name, product.category, 'joyería mexicana', 'anillos', 'collares', 'accesorios'],
    openGraph: {
      title: product.name,
      description: cleanDescription,
      images: product.images?.[0] ? [{ url: product.images[0], alt: product.name }] : [],
      type: 'product',
      locale: 'es-MX',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: cleanDescription,
      images: product.images?.[0] ? [product.images[0]] : [],
    }
  };
}

// We need to modify this function to work with Next.js static generation
export async function generateStaticParams() {
  // For static generation, we need a different approach
  // This creates a direct connection to Supabase
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: products, error } = await supabase
    .from('products')
    .select('id');

  if (error) {
    console.error('Error fetching product IDs from Supabase:', error);
    return [];
  }

  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

// Structured Data component for the product
function StructuredData({ product }) {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0] || '',
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Aceves Joyería"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://aceves-store.com/producto/${product.id}`,
      "price": product.price,
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Aceves Joyería"
      }
    }
  };

  return (
    <Script
      id={`structured-data-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ProductoPage({ params }) {
  // Use the correct pattern for cookies in Next.js
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Need to await params.id
  const id = await params.id;
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    return <div className="p-6">Producto no encontrado.</div>;
  }

  // Get related products in the same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', id)
    .limit(4);

  return (
    <>
      <StructuredData product={product} />
      <ProductoView product={product} relatedProducts={relatedProducts || []} />
    </>
  );
}