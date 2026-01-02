// app/collares/page.jsx
import Link from 'next/link';
import { createServerSupabaseClient } from '../../lib/supabase-server';
import PageWrapper from '../components/PageWrapper';
import ExpandableSection from '../components/ExpandableSection';
import Script from 'next/script';

export const metadata = {
  title: 'Collares de Pareja | Joyería Artesanal para Enamorados | Aceves',
  description: 'Descubre nuestra colección de collares de pareja artesanales. Plata de alta calidad, diseños únicos para enamorados. Envío gratis en compras +$999. ¡Expresa tu amor con Aceves!',
  keywords: ['collares de pareja', 'collares para novios', 'joyería mexicana', 'collares de amor', 'collares artesanales', 'collares de promesa'],
  openGraph: {
    title: 'Collares de Pareja | Joyería Artesanal para Enamorados',
    description: 'Descubre nuestra colección de collares de pareja artesanales. Envío gratis en compras desde $999. ¡Expresa tu amor con Aceves!',
    locale: 'es-MX',
    type: 'website',
  }
};

// Schema FAQPage para SEO
function CollaresSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué significan los collares de pareja?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los collares de pareja representan un vínculo especial entre dos personas enamoradas. Son una forma de mostrar al mundo que pertenecen el uno al otro y de llevarse mutuamente siempre cerca del corazón."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo elegir el collar de pareja perfecto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El collar perfecto debe reflejar el estilo de ambos y tener un significado especial para la pareja. En Aceves ofrecemos diseños complementarios que se ven perfectos cuando están juntos, pero también hermosos por separado."
        }
      },
      {
        "@type": "Question",
        "name": "¿De qué materiales están hechos los collares de pareja?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nuestros collares de pareja están elaborados con materiales de alta calidad como plata de ley y acero inoxidable, garantizando durabilidad y resistencia al uso diario. Cada pieza es diseñada artesanalmente para que sea única como su historia de amor."
        }
      }
    ]
  };

  return (
    <Script
      id="collares-faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function CollaresPage() {
  const supabase = await createServerSupabaseClient();

  let products = [];
  let error = null;

  try {
    const { data, error: supabaseError } = await supabase
      .from('products')
      .select('*')
      .eq('category', 'collares');

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    products = data || [];
    console.log(`Found ${products.length} collares products in Supabase`);

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
      products = allProducts.filter(p => p.category === 'collares');
      console.log(`Found ${products.length} collares products in local JSON`);
    } catch (fileErr) {
      console.error('Error reading fallback file:', fileErr);
    }
  }

  return (
    <PageWrapper>
      <CollaresSchema />

      {/* Breadcrumbs para SEO */}
      <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-[#092536]">Inicio</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">›</span>
            <span className="text-[#092536] font-medium">Collares de Pareja</span>
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-[#092536] mb-4">Collares de Pareja</h1>

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
            src="https://hnaptwk79kknvilx.public.blob.vercel-storage.com/banners/banner_collares-yaV6BwuheDM9ALap1kv6ZTgXDHcXl2.jpg"
            alt="Collares de Pareja para Enamorados - Colección Aceves"
            className="w-[calc(100%+2rem)] -mx-4 max-w-none md:w-full md:mx-0 md:max-w-full rounded-none md:rounded-xl mb-8"
            width="1200"
            height="600"
          />

          {products.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-lg text-gray-600">No hay collares disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`} className="group">
                  <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-lg transition duration-300 ease-in-out cursor-pointer group-hover:scale-[1.02]">
                    <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg mb-4 bg-background relative">
                      <img
                        src={product.images?.[0]}
                        alt={`Collar de pareja ${product.name} - Joyería Aceves`}
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

          {/* Expandable Section con información detallada */}
          <ExpandableSection
            title="Información Detallada sobre Collares de Pareja"
            className="mt-8"
          >
            <div className="text-black leading-relaxed space-y-4">
              <p>
                Descubre nuestra colección de <strong>collares de pareja</strong> únicos, diseñados especialmente
                para celebrar el amor entre dos personas. Cada pieza está creada artesanalmente con materiales
                de alta calidad como plata de ley y acero inoxidable, resistentes al uso diario y pensados para
                durar tanto como su amor.
              </p>
              <p>
                Los <strong>collares de pareja</strong> de Aceves representan un vínculo especial. Son perfectos
                para novios que desean llevar un símbolo de su amor cerca del corazón. Cada diseño está pensado
                para complementarse, creando un conjunto hermoso cuando están juntos, pero también luciendo
                espectacular por separado.
              </p>
              <p>
                Explora nuestra colección y encuentra el collar perfecto para expresar su conexión única y especial.
              </p>
            </div>
          </ExpandableSection>

          {/* Sección de FAQ para usuarios y SEO */}
          <section className="mt-16 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-6">Preguntas Frecuentes sobre Collares de Pareja</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-black">¿Qué significan los collares de pareja?</h3>
                <p className="mt-2 text-gray-700">
                  Los collares de pareja representan un vínculo especial entre dos personas enamoradas. Son una
                  forma de mostrar al mundo que pertenecen el uno al otro y de llevarse mutuamente siempre cerca
                  del corazón. En Aceves, diseñamos cada collar pensando en esa conexión única que cada pareja
                  comparte.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Cómo elegir el collar de pareja perfecto?</h3>
                <p className="mt-2 text-gray-700">
                  El collar perfecto debe reflejar el estilo de ambos y tener un significado especial para la
                  pareja. En Aceves ofrecemos diseños complementarios que se ven perfectos cuando están juntos,
                  pero también hermosos por separado. Considera el estilo personal de cada uno, si prefieren
                  diseños minimalistas o más llamativos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿De qué materiales están hechos los collares de pareja?</h3>
                <p className="mt-2 text-gray-700">
                  Nuestros collares de pareja están elaborados con materiales de alta calidad como plata de ley
                  y acero inoxidable, garantizando durabilidad y resistencia al uso diario. Cada pieza es diseñada
                  artesanalmente para que sea única como su historia de amor. Todos nuestros materiales son
                  hipoalergénicos y aptos para uso constante.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black">¿Se pueden personalizar los collares de pareja?</h3>
                <p className="mt-2 text-gray-700">
                  ¡Sí! Ofrecemos opciones de personalización como grabados de nombres, fechas importantes o
                  mensajes especiales. Los collares de pareja personalizados son perfectos para aniversarios,
                  cumpleaños o cualquier ocasión especial donde quieran celebrar su amor único.
                </p>
              </div>
            </div>
          </section>

          {/* CTA final */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-bold text-primary mb-4">Encuentra el Collar de Pareja Perfecto</h2>
            <p className="text-lg text-gray-700 mb-6">
              Explora nuestra colección de collares de pareja artesanales y encuentra la pieza ideal para
              expresar su amor. Envío gratis en compras mayores a $999 MXN.
            </p>
            <Link
              href="/guia-cuidados"
              className="inline-block bg-primary text-white px-6 py-3 rounded-full hover:bg-accent transition-colors"
            >
              Cuidados para tus Collares
            </Link>
          </div>
        </>
      )}

    </PageWrapper>
  );
}