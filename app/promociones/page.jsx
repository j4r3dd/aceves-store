// app/promociones/page.jsx
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import PageWrapper from '../components/PageWrapper';
import CountdownTimer from '../components/CountdownTimer';
import Script from 'next/script';

export const metadata = {
  title: 'Promociones y Ofertas | Joyería Aceves',
  description: 'Aprovecha nuestras promociones exclusivas en anillos y collares. Descuentos especiales en joyería artesanal mexicana. ¡Ofertas por tiempo limitado!',
  keywords: ['promociones joyería', 'ofertas anillos', 'descuentos collares', 'joyería en oferta', 'promociones Aceves'],
  openGraph: {
    title: 'Promociones y Ofertas | Joyería Aceves',
    description: 'Descuentos especiales en joyería artesanal. ¡Aprovecha nuestras ofertas por tiempo limitado!',
    locale: 'es-MX',
    type: 'website',
  }
};

// Schema for SEO
function PromotionsSchema({ products }) {
  if (!products || products.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    "name": "Promociones Aceves Joyería",
    "description": "Ofertas especiales en joyería artesanal mexicana",
    "itemListElement": products.map((product, index) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0],
        "url": `https://www.acevesoficial.com/producto/${product.id}`
      },
      "price": product.price,
      "priceCurrency": "MXN",
      "availability": "https://schema.org/InStock"
    }))
  };

  return (
    <Script
      id="promotions-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function PromocionesPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  let products = [];
  let error = null;

  try {
    // Fetch products that have a discount (original_price > price)
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .not('original_price', 'is', null)
      .gt('original_price', 0);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    // Filter products where original_price > price (actual discounts)
    products = (data || []).filter(p => p.original_price > p.price);
    console.log(`Found ${products.length} products on promotion`);

  } catch (err) {
    console.error('Error fetching promotions:', err);
    error = err;
  }

  // Calculate discount percentage
  const getDiscountPercentage = (originalPrice, currentPrice) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  return (
    <PageWrapper>
      <PromotionsSchema products={products} />

      {/* Breadcrumbs para SEO */}
      <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-[#092536]">Inicio</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">›</span>
            <span className="text-[#092536] font-medium">Promociones</span>
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-[#092536] mb-4">Promociones y Ofertas</h1>

      {error && products.length === 0 ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar las promociones: {error.message}</p>
        </div>
      ) : (
        <>
          {/* Banner de promociones con countdown */}
          <div className="bg-gradient-to-r from-[#092536] to-[#759bbb] text-white rounded-xl p-6 mb-8 text-center">
            <h2 className="text-xl font-bold mb-2">¡Ofertas Especiales!</h2>
            <p className="text-sm opacity-90 mb-4">Aprovecha nuestros descuentos por tiempo limitado</p>
            <p className="text-xs opacity-70 mb-3">La oferta termina en:</p>
            <CountdownTimer />
          </div>

          {products.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-600 mb-4">No hay promociones activas en este momento.</p>
              <p className="text-gray-500 mb-6">¡Vuelve pronto para descubrir nuevas ofertas!</p>
              <Link
                href="/"
                className="inline-block bg-[#092536] text-white px-6 py-3 rounded-full hover:bg-[#759bbb] transition-colors"
              >
                Ver todos los productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group">
                  <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 ease-in-out cursor-pointer group-hover:scale-[1.02] relative">
                    {/* Discount badge */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                      -{getDiscountPercentage(product.original_price, product.price)}%
                    </div>

                    {/* Envio Cruzado badge */}
                    {product.envio_cruzado && (
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
                        Envío cruzado disponible
                      </div>
                    )}

                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background">
                      <img
                        src={product.images?.[0]}
                        alt={`${product.name} en oferta - Joyería Aceves`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        width="300"
                        height="300"
                        loading="lazy"
                      />
                    </div>
                    <h2 className="text-base font-semibold text-[#092536] leading-tight line-clamp-2">
                      {product.name}
                    </h2>

                    <div className="mt-2">
                      <span className="text-gray-400 line-through text-sm mr-2">
                        ${product.original_price} MXN
                      </span>
                      <span className="text-red-500 font-bold">
                        ${product.price} MXN
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Info section */}
          <section className="mt-12 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">Sobre Nuestras Promociones</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                En Aceves Joyería queremos que puedas lucir piezas únicas sin comprometer tu presupuesto.
                Por eso, regularmente ofrecemos descuentos especiales en nuestra colección de anillos y collares.
              </p>
              <p>
                <strong>¿Cómo funcionan nuestras promociones?</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Los descuentos se aplican automáticamente al precio mostrado</li>
                <li>Las ofertas son por tiempo limitado y sujetas a disponibilidad</li>
                <li>Envío gratis en compras mayores a $999 MXN</li>
                <li>Todas nuestras piezas incluyen garantía de calidad</li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-[#092536] mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-6">
              Explora nuestra colección completa de joyería artesanal
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/anillos"
                className="inline-block bg-[#092536] text-white px-6 py-3 rounded-full hover:bg-[#759bbb] transition-colors"
              >
                Ver Anillos
              </Link>
              <Link
                href="/collares"
                className="inline-block border-2 border-[#092536] text-[#092536] px-6 py-3 rounded-full hover:bg-[#092536] hover:text-white transition-colors"
              >
                Ver Collares
              </Link>
            </div>
          </div>
        </>
      )}
    </PageWrapper>
  );
}
