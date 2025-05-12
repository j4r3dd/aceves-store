// app/anillos/page.jsx 
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import PageWrapper from '../components/PageWrapper';
import Script from 'next/script';

export const metadata = {
  title: 'Anillos de Promesa | Joyería Artesanal para Parejas | Aceves',
  description: 'Descubre nuestra colección de anillos de promesa artesanales para parejas. Plata de alta calidad, envío gratis en compras +$999. ¡Expresa tu amor con Aceves!',
  keywords: ['anillos de promesa', 'anillos para parejas', 'joyería mexicana', 'anillos de pareja', 'anillos de promesa plata', 'anillos de promesa amor'],
  openGraph: {
    title: 'Anillos de Promesa | Joyería Artesanal para Parejas',
    description: 'Descubre nuestra colección de anillos de promesa artesanales. Envío gratis en compras desde $999. ¡Regala amor con Aceves!',
    locale: 'es-MX',
    type: 'website',
  }
};

// Schema FAQPage para SEO
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
          "text": "Regalar un anillo de promesa es una manera de demostrar compromiso y amor. Representa una promesa entre parejas, ya sea de fidelidad, amor eterno o un futuro compromiso de matrimonio."
        }
      },
      {
        "@type": "Question",
        "name": "¿En qué dedo se usa el anillo de promesa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tradicionalmente, el anillo de promesa se usa en el dedo anular de la mano derecha, reservando el dedo anular izquierdo para el anillo de compromiso y matrimonio."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es la diferencia entre anillo de promesa y compromiso?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Un anillo de promesa representa un compromiso personal entre parejas, mientras que un anillo de compromiso simboliza específicamente la intención de matrimonio futuro. Los anillos de promesa suelen ser más sencillos y accesibles que los de compromiso."
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

export default async function AnillosPage() {
  // Use the correct pattern for cookies
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
      <FAQSchema />
      
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

      <h1 className="text-3xl font-bold text-primary mb-4">Anillos de Promesa </h1>
      
      {/* Introducción SEO-friendly */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <p className="text-gray-700 mb-4">
          Descubre nuestra colección de <strong>anillos de promesa</strong> únicos, creados para celebrar 
          el amor y compromiso entre parejas. Cada pieza está diseñada artesanalmente con materiales 
          de alta calidad como acero inoxidable y plata, resistentes al uso diario y pensados para durar, 
          como tu historia de amor.
        </p>
        <p className="text-gray-700">
          En Aceves entendemos que regalar un <strong>anillo de promesa</strong> significa decir "te amo" sin 
          palabras. Es un símbolo de conexión y compromiso. Explora nuestra colección y encuentra 
          el anillo perfecto para sellar tu promesa de amor.
        </p>
      </div>

      <h2 className="text-2xl font-semibold text-primary mb-4">Envío Gratis en Anillos de Promesa</h2>

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
            className="w-full rounded-xl mb-8"
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
                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background">
                      <img
                        src={product.images?.[0]}
                        alt={`Anillo de promesa ${product.name} - Joyería Aceves`}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        width="300"
                        height="300"
                        loading="lazy"
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
          
          {/* Sección de FAQ para usuarios y SEO */}
          <section className="mt-16 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-primary mb-6">Preguntas Frecuentes sobre Anillos de Promesa</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-primary">¿Qué significa regalar un anillo de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  Regalar un anillo de promesa es una manera de demostrar compromiso y amor. Representa una promesa 
                  entre parejas, ya sea de fidelidad, amor eterno o un futuro compromiso de matrimonio. En Aceves 
                  creamos joyería con alma para que puedas expresar tus sentimientos de forma tangible.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-primary">¿En qué dedo se usa el anillo de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  Tradicionalmente, el anillo de promesa se usa en el dedo anular de la mano derecha, reservando 
                  el dedo anular izquierdo para el anillo de compromiso y matrimonio. Sin embargo, puedes llevarlo 
                  en el dedo que prefieras, ya que lo importante es el significado que tiene para ti y tu pareja.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-primary">¿Cuál es la diferencia entre anillo de promesa y compromiso?</h3>
                <p className="mt-2 text-gray-700">
                  Un anillo de promesa representa un compromiso personal entre parejas, mientras que un anillo de 
                  compromiso simboliza específicamente la intención de matrimonio futuro. Los anillos de promesa 
                  suelen ser más sencillos y accesibles que los de compromiso, pero igual de significativos en 
                  su representación del amor.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-primary">¿De qué materiales están hechos los anillos de promesa?</h3>
                <p className="mt-2 text-gray-700">
                  En Aceves, nuestros anillos de promesa están elaborados con materiales de alta calidad como acero 
                  inoxidable y plata, resistentes al uso diario. Cada pieza está diseñada artesanalmente para que sea 
                  única, duradera y capaz de resistir el paso del tiempo, al igual que tu promesa de amor.
                </p>
              </div>
            </div>
          </section>
          
          {/* CTA final */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Encuentra el Anillo de Promesa Perfecto</h2>
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