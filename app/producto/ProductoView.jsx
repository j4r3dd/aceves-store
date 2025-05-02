'use client';
import Link from 'next/link'
import { useState, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import Slider from '../components/Slider';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; 
import ProductSchema from '../components/ProductSchema';
import BreadcrumbSchema from '../components/BreadcrumbsSchema';

export default function ProductoView({ product, relatedProducts = [] }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const router = useRouter();
  
  // Set first available size as default, if any are in stock
  useEffect(() => {
    if (product.sizes && Array.isArray(product.sizes)) {
      const availableSizes = product.sizes.filter(({ stock }) => stock > 0);
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0].size);
      }
    }
  }, [product]);

  const handleAdd = () => {
    if (product.sizes && Array.isArray(product.sizes) && !selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    addToCart({
      ...product,
      selectedSize
    });
    
    // Scroll to top for better UX after adding to cart
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const breadcrumbs = [
    { name: 'Inicio', url: 'https://www.acevesoficial.com/' },
    { name: product.category === 'anillos' ? 'Anillos' : 
             product.category === 'collares' ? 'Collares' : 
             product.category, 
      url: `https://www.acevesoficial.com/${product.category}` },
    { name: product.name, url: `https://acevesoficial.com/producto/${product.id}` }
  ];


  return (
    <PageWrapper>
      {/* Breadcrumbs for SEO and UX */}
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-[#092536]">Inicio</Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">›</span>
            <Link 
              href={`/${product.category}`} 
              className="hover:text-[#092536]"
            >
              {product.category === 'anillos' ? 'Anillos' : 
               product.category === 'collares' ? 'Collares' : 
               product.category}
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-1">›</span>
            <span className="text-[#092536] font-medium">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column: slider */}
        <div>
          <Slider images={product.images || [product.image]} productName={product.name} />
        </div>

        {/* Right column: product details */}
        <div className="flex flex-col gap-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#092536] font-geist-sans">{product.name}</h1>

          {/* Price */}
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-[#092536]">${product.price.toLocaleString()} MXN</p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-lg text-gray-500 line-through">${product.original_price.toLocaleString()} MXN</p>
            )}
          </div>

          {/* Description with structured paragraphs for better SEO */}
          <div className="text-gray-700 leading-relaxed space-y-4">
            {product.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Sizes */}
          {product.sizes && Array.isArray(product.sizes) && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Talla</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(({ size, stock }) => {
                  const isOutOfStock = stock === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      aria-label={`Seleccionar talla ${size}${isOutOfStock ? ' (Agotado)' : ''}`}
                      className={`
                        border rounded-full px-6 py-2 text-sm transition
                        ${isSelected ? 'bg-[#092536] text-white' : 'text-[#092536] border-[#092536] hover:bg-[#092536] hover:text-white'}
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {size} {isOutOfStock && '(Agotado)'}
                    </button>
                  );
                })}
              </div>
              <Link href="/guia-tallas" className="text-xs text-gray-500 mt-1 inline-block underline">
                Guía de tallas
              </Link>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            aria-label="Agregar al carrito"
            className="bg-black text-white rounded-full py-3 font-semibold hover:bg-gray-800 transition"
          >
            AGREGAR AL CARRITO
          </button>

          {/* Shipping Note - good for SEO and CRO */}
          <div className="text-sm text-gray-600 mt-4">
            <p>
              Compra antes de las <strong>11 am</strong> y recibe tu pedido el siguiente día
            </p>
            <p className="mt-2 font-semibold">
              Despacho Estándar Gratis
              <br />
              <span className="font-normal">
                Por compras superiores a $999 recibe envío gratis
              </span>
            </p>
          </div>
          
          {/* Material information for SEO */}
          <div className="mt-4 border-t pt-4">
            <h2 className="text-sm font-semibold text-gray-700">Información del Producto</h2>
            <dl className="mt-2 text-sm text-gray-600 space-y-1">
              <div className="flex gap-2">
                <dt className="font-medium">Material:</dt>
                <dd>Acero inoxidable / Plata</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">Categoría:</dt>
                <dd>
                  <Link 
                    href={`/${product.category}`}
                    className="underline hover:text-[#092536]"
                  >
                    {product.category === 'anillos' ? 'Anillos' : 
                     product.category === 'collares' ? 'Collares' : 
                     product.category}
                  </Link>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium">SKU:</dt>
                <dd>{product.id}</dd>
              </div>
            </dl>
          </div>
          
          {/* Social sharing - helps SEO indirectly */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm text-gray-700">Compartir:</span>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.acevesoficial.com/producto/${product.id}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Compartir en Facebook"
              className="hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira este hermoso ${product.name} de @acevesjoyeria`)}&url=${encodeURIComponent(`https://www.acevesoficial.com/producto/${product.id}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Compartir en Twitter"
              className="hover:text-blue-400"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/></svg>
            </a>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Mira lo que encontré en Aceves Joyería! ${product.name}: https://www.acevesoficial.com/producto/${product.id}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Compartir en WhatsApp"
              className="hover:text-green-500"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.798.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.2-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Related Products Section - great for SEO */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#092536] mb-6">También podría interesarte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/producto/${relatedProduct.id}`} className="group">
                <div className="bg-white border rounded-lg p-3 hover:shadow-md transition duration-300">
                  <div className="aspect-square overflow-hidden rounded-md mb-3 bg-[#f9f9f9]">
                    <img
                      src={relatedProduct.images?.[0]}
                      alt={relatedProduct.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-[#092536] line-clamp-2 mb-1">{relatedProduct.name}</h3>
                  <p className="text-sm font-semibold text-[#092536]">${relatedProduct.price.toLocaleString()} MXN</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* Product guarantees section - boosts conversion */}
      <section className="mt-16 bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-8">Por qué comprar en Aceves Joyería</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#f9f9f9] mb-3">
              <svg className="w-6 h-6 text-[#092536]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-medium text-[#092536] mb-1">Garantía de 30 días</h3>
            <p className="text-sm text-gray-600">Garantizamos la calidad de todos nuestros productos</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#f9f9f9] mb-3">
              <svg className="w-6 h-6 text-[#092536]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4V5l8 4 8-4v2z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#092536] mb-1">Envío gratuito</h3>
            <p className="text-sm text-gray-600">En compras mayores a $999 MXN</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-full bg-[#f9f9f9] mb-3">
              <svg className="w-6 h-6 text-[#092536]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#092536] mb-1">Atención personalizada</h3>
            <p className="text-sm text-gray-600">Te apoyamos en todo el proceso de compra</p>
          </div>
        </div>
      </section>

      {/* Add structured data components */}
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <ProductSchema product={product} />
    </PageWrapper>
  );
}