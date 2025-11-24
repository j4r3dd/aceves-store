// app/sitemap.js
import { createClient } from '@supabase/supabase-js';

export default async function sitemap() {
  // Create a direct Supabase client for sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const baseUrl = 'https://www.acevesoficial.com';
  
  // Get all products
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at');
    
  // Create product URLs
  const productUrls = products?.map(product => ({
    url: `${baseUrl}/producto/${product.id}`,
    lastModified: product.updated_at || new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8
  })) || [];
  
  // Static pages
  const routes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/anillos`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/collares`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/promociones`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/FAQ`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/Nosotros`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/guia-tallas`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/guia-cuidados`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    },
    {
      url: `${baseUrl}/devoluciones`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];
  
  return [...routes, ...productUrls];
}