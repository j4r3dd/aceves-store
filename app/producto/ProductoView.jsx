'use client';

import PageWrapper from '../components/PageWrapper'; // ✅ Adjust if needed
import Slider from '../components/Slider';
import { useCart } from '../../context/CartContext';

export default function ProductoView({ product }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column: slider */}
        <div>
          <Slider images={product.images || [product.image]} />
        </div>

        {/* Right column: product details */}
        <div className="flex flex-col gap-6">
          {/* Title */}
          <h1 className="text-3xl font-bold text-[#092536] font-geist-sans">{product.name}</h1>

          {/* Price */}
          <p className="text-2xl font-semibold text-[#092536]">${product.price.toLocaleString()} MXN</p>

          {/* Description */}
          <div className="text-gray-700 leading-relaxed space-y-4">
            {product.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Talla</h3>
            <div className="flex gap-2 flex-wrap">
              {['Unitalla'].map((size) => (
                <button
                  key={size}
                  className="border rounded-full px-6 py-2 text-[#092536] border-[#092536] hover:bg-[#092536] hover:text-white transition"
                >
                  {size}
                </button>
              ))}
            </div>
            <a href="#" className="text-xs text-gray-500 mt-1 inline-block underline">
              Guía de tallas
            </a>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="bg-black text-white rounded-full py-3 font-semibold hover:bg-gray-800 transition"
          >
            AGREGAR AL CARRITO
          </button>

          {/* Shipping Note */}
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
        </div>
      </div>
    </PageWrapper>
  );
}
