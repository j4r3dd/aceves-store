// app/anillos/page.jsx
import Link from 'next/link';
import { createServerSupabaseClient } from '../../lib/supabase-server';
import PageWrapper from '../components/PageWrapper';
import ExpandableSection from '../components/ExpandableSection';
import Script from 'next/script';
import BreadcrumbSchema from '../components/BreadcrumbsSchema';


export const metadata = {
  title: 'Anillos de Promesa | Joyería Artesanal para Parejas | Aceves',
  description: 'Descubre nuestra colección de anillos de promesa artesanales para parejas. Plata de alta calidad, diseños únicos y envío gratis en compras +$999. ¡Expresa tu amor con Aceves!',
  keywords: [
    'anillos de promesa',
    'anillos de promesa para parejas',
    'anillos de promesa México',
    'anillos de promesa baratos',
    'anillos de promesa plata',
    'anillos de promesa para mujer',
    'anillos de promesa para hombre',
    'anillos para parejas',
    'anillos de pareja',
    'anillos de compromiso',
    'joyería mexicana',
    'anillos de promesa amor',
    'anillos de promesa originales',
    'donde comprar anillos de promesa'
  ],
  alternates: {
    canonical: 'https://www.acevesoficial.com/anillos',
  },
  openGraph: {
    title: 'Anillos de Promesa | Joyería Artesanal para Parejas | Aceves',
    description: 'Descubre nuestra colección de anillos de promesa artesanales. Diseños únicos en plata, envío gratis en compras desde $999. ¡Regala amor con Aceves!',
    url: 'https://www.acevesoficial.com/anillos',
    siteName: 'Aceves Joyería',
    images: [
      {
        url: 'https://hnaptwk79kknvilx.public.blob.vercel-storage.com/banners/banner_Anillo_mano-TO0508YUiYZrBxIAy0mgQ8yWX50QtW.jpg',
        width: 1200,
        height: 630,
        alt: 'Anillos de Promesa para Parejas - Colección Aceves Joyería',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anillos de Promesa | Joyería Artesanal | Aceves',
    description: 'Colección de anillos de promesa artesanales para parejas. Plata de alta calidad, envío gratis +$999.',
    images: ['https://hnaptwk79kknvilx.public.blob.vercel-storage.com/banners/banner_Anillo_mano-TO0508YUiYZrBxIAy0mgQ8yWX50QtW.jpg'],
  },
};

// Schema FAQPage para SEO - Optimizado para "anillos de promesa"
function FAQSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué significa regalar un anillo de promesa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Regalar un anillo de promesa es una manera de demostrar compromiso y amor. Representa una promesa entre parejas, ya sea de fidelidad, amor eterno o un futuro compromiso de matrimonio. Es un símbolo significativo que fortalece la relación."
        }
      },
      {
        "@type": "Question",
        "name": "¿En qué dedo se usa el anillo de promesa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tradicionalmente, el anillo de promesa se usa en el dedo anular de la mano derecha, reservando el dedo anular izquierdo para el anillo de compromiso y matrimonio. Sin embargo, puedes usarlo en el dedo que prefieras."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre anillo de promesa y compromiso?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Un anillo de promesa representa un compromiso personal entre parejas, mientras que un anillo de compromiso simboliza específicamente la intención de matrimonio futuro. Los anillos de promesa suelen ser más sencillos y accesibles que los de compromiso."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuesta un anillo de promesa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En Aceves, los anillos de promesa tienen precios accesibles desde $299 MXN hasta $1,500 MXN, dependiendo del diseño y materiales. Ofrecemos opciones en plata 925 y acero inoxidable con envío gratis en compras mayores a $999 MXN."
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde comprar anillos de promesa en México?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En Aceves Joyería puedes comprar anillos de promesa en línea con envío a todo México. Somos una joyería mexicana especializada en anillos de promesa artesanales con diseños únicos y materiales de alta calidad. Envío gratis en compras desde $999 MXN."
        }
      },
      {
        "@type": "Question",
        "name": "¿Los anillos de promesa son para hombre y mujer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, los anillos de promesa son para ambos. En Aceves tenemos diseños unisex y también opciones específicas para hombre y mujer. Muchas parejas eligen anillos a juego para simbolizar su compromiso mutuo."
        }
      }
    ]
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Schema ItemList para colección de productos
function ItemListSchema({ products }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Anillos de Promesa - Colección Aceves",
    "description": "Colección de anillos de promesa artesanales para parejas. Diseños únicos en plata 925 y acero inoxidable.",
    "url": "https://www.acevesoficial.com/anillos",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `https://www.acevesoficial.com/producto/${product.id}`,
          "name": product.name,
          "image": product.images?.[0] || '',
          "url": `https://www.acevesoficial.com/producto/${product.id}`,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "MXN",
            "availability": product.outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"
          }
        }
      }))
    }
  };

  return (
    <Script
      id="itemlist-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function AnillosPage() {
  const supabase = await createServerSupabaseClient();

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


  // Breadcrumbs data for schema
  const breadcrumbs = [
    { name: 'Inicio', url: 'https://www.acevesoficial.com/' },
    { name: 'Anillos de Promesa', url: 'https://www.acevesoficial.com/anillos' }
  ];

  return (
    <PageWrapper>
      <FAQSchema />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <ItemListSchema products={products} />

      {/* Breadcrumbs para SEO */}
      <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-[#092536]">Inicio</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">›</span>
            <span className="text-[#092536] font-medium">Anillos de Promesa</span>
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-[#092536] mb-4">Anillos de Promesa </h1>

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
            alt="Anillos de Promesa para Parejas - Colección Aceves"
            className="w-[calc(100%+2rem)] -mx-4 max-w-none md:w-full md:mx-0 md:max-w-full rounded-none md:rounded-xl mb-8"
            width="1200"
            height="600"
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
                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background relative">
                      <img
                        src={product.images?.[0]}
                        alt={`Anillo de promesa ${product.name} - Joyería Aceves`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        width="300"
                        height="300"
                        loading="lazy"
                      />
                      {product.envio_cruzado && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                          Envío cruzado disponible
                        </div>
                      )}
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

          <ExpandableSection
            title="Información Detallada sobre Anillos de Promesa"
            className="mt-8"
          >
            <div className="text-black leading-relaxed space-y-4">
              <p>
                Descubre nuestra colección de <strong>anillos de promesa</strong> únicos, creados para celebrar
                el amor y compromiso entre parejas. Cada pieza está diseñada artesanalmente con materiales
                de alta calidad como acero inoxidable y plata, resistentes al uso diario y pensados para durar,
                como tu historia de amor.
              </p>
              <p>
                En Aceves entendemos que regalar un <strong>anillo de promesa</strong> significa decir "te amo" sin
                palabras. Es un símbolo de conexión y compromiso. Explora nuestra colección y encuentra
                el anillo perfecto para sellar tu promesa de amor.
              </p>
            </div>
          </ExpandableSection>

          {/* Sección de FAQ para usuarios y SEO */}
          <section className="mt-16 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-6">Preguntas Frecuentes sobre Anillos de Promesa</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-black">¿Qué significa regalar un anillo de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  Regalar un anillo de promesa es una manera de demostrar compromiso y amor. Representa una promesa
                  entre parejas, ya sea de fidelidad, amor eterno o un futuro compromiso de matrimonio. En Aceves
                  creamos joyería con alma para que puedas expresar tus sentimientos de forma tangible.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿En qué dedo se usa el anillo de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  Tradicionalmente, el anillo de promesa se usa en el dedo anular de la mano derecha, reservando
                  el dedo anular izquierdo para el anillo de compromiso y matrimonio. Sin embargo, puedes llevarlo
                  en el dedo que prefieras, ya que lo importante es el significado que tiene para ti y tu pareja.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Cuál es la diferencia entre anillo de promesa y compromiso?</h3>
                <p className="mt-2 text-gray-700">
                  Un anillo de promesa representa un compromiso personal entre parejas, mientras que un anillo de
                  compromiso simboliza específicamente la intención de matrimonio futuro. Los anillos de promesa
                  suelen ser más sencillos y accesibles que los de compromiso, pero igual de significativos en
                  su representación del amor.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿De qué materiales están hechos los anillos de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  En Aceves, nuestros anillos de promesa están elaborados con materiales de alta calidad como acero
                  inoxidable y plata, resistentes al uso diario. Cada pieza está diseñada artesanalmente para que sea
                  única, duradera y capaz de resistir el paso del tiempo, al igual que tu promesa de amor.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Cuánto cuesta un anillo de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  En Aceves, los anillos de promesa tienen precios accesibles desde $299 MXN hasta $1,500 MXN,
                  dependiendo del diseño y materiales. Ofrecemos opciones en plata 925 y acero inoxidable con
                  envío gratis en compras mayores a $999 MXN en todo México.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Dónde comprar anillos de promesa en México?</h3>
                <p className="mt-2 text-gray-700">
                  En Aceves Joyería puedes comprar anillos de promesa en línea con envío a todo México. Somos una
                  joyería mexicana especializada en anillos de promesa artesanales con diseños únicos y materiales
                  de alta calidad. Realizamos envíos a toda la República Mexicana con envío gratis en compras desde $999 MXN.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Los anillos de promesa son para hombre y mujer?</h3>
                <p className="mt-2 text-gray-700">
                  Sí, los anillos de promesa son para ambos. En Aceves tenemos diseños unisex perfectos para parejas,
                  y también opciones específicas para hombre y mujer. Muchas parejas eligen anillos a juego para
                  simbolizar su compromiso mutuo y llevar siempre un recordatorio de su amor.
                </p>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-primary mb-4">Encuentra el Anillo de Promesa Perfecto</h2>
            <p className="text-lg text-gray-700 mb-6">
              Explora nuestra colección de anillos de promesa artesanales y encuentra la pieza ideal para
              expresar tu amor. Envío gratis en compras mayores a $999 MXN.
            </p>
            <Link
              href="/guia-tallas"
              className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-accent transition-colors"
            >
              Ver Guía de Tallas para Anillos
            </Link>
          </div>
        </>
      )}

    </PageWrapper>
  );
}