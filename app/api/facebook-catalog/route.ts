// app/api/facebook-catalog/route.ts
// Facebook Product Catalog Feed (XML/RSS format)

import { NextResponse } from 'next/server';
import { getAllProducts } from '../../../lib/api/handlers/products';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const products = await getAllProducts();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.acevesoficial.com';

    // Generate XML feed in Facebook-compatible format
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Aceves Store - Catálogo de Productos</title>
    <link>${baseUrl}</link>
    <description>Joyería de plata 925 - Anillos, collares y más</description>
    ${products.map(product => {
      // Get main image and additional images
      const images = Array.isArray(product.images) ? product.images : [];
      const mainImage = images[0] || '';
      const additionalImages = images.slice(1);

      // Determine availability - check if product has stock
      const availability = product.stock !== undefined && product.stock > 0
        ? 'in stock'
        : 'in stock'; // Default to in stock for jewelry

      // Clean description for XML
      const cleanDescription = (product.description || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      const cleanTitle = (product.name || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      // Product URL - use slug if available, otherwise id
      const productUrl = product.slug
        ? `${baseUrl}/producto/${product.slug}`
        : `${baseUrl}/producto/${product.id}`;

      return `
    <item>
      <g:id>${product.id}</g:id>
      <g:title>${cleanTitle}</g:title>
      <g:description>${cleanDescription}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${mainImage}</g:image_link>
      ${additionalImages.map(img => `<g:additional_image_link>${img}</g:additional_image_link>`).join('\n      ')}
      <g:availability>${availability}</g:availability>
      <g:price>${product.price} MXN</g:price>
      <g:brand>Aceves</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>Apparel &amp; Accessories &gt; Jewelry</g:google_product_category>
      <g:product_type>${product.category || 'Joyería'}</g:product_type>
      ${product.envio_cruzado ? '<g:shipping_label>Envío Cruzado</g:shipping_label>' : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating Facebook catalog feed:', error);
    return new NextResponse('Error generating catalog feed', { status: 500 });
  }
}
