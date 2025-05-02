// app/sitemap.js
import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  // Create a direct Supabase client for sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const baseUrl = 'https://aceves-store.com'; // Replace with your domain
  
  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at');
    
  // Create product URLs
  const productUrls = products?.map(product => ({
    url: `${baseUrl}/producto/${product.id}`,
    lastModified: product.updated_at || new Date().toISOString(),
  })) || [];
  
  // Static pages
  const routes = [
    '',
    '/anillos',
    '/collares',
    '/promociones',
    '/FAQ',
    '/Nosotros',
    '/guia-tallas',
    '/guia-cuidados',
    '/devoluciones'
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));
  
  return [...routes, ...productUrls];
}