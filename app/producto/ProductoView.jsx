// app/producto/ProductoView.jsx
'use client';
import Slider from '../components/Slider';
import { useCart } from '../../context/CartContext';

export default function ProductoView({ product }) {
  console.log("📦 product.images", product.images);
  const { addToCart } = useCart(); //👈 grab the function

  const handleAdd = () => {
    addToCart(product); // 👈 add the product to the cart
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left column: slider */}
      <div>
        <Slider images={product.images || [product.image]} />
      </div>

      {/* Right column: product details */}
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-xl font-bold text-gray-800">${product.price.toLocaleString()} MXN</p>

        {/* Description */}
        <p className="text-gray-600">{product.description}</p>

        {/* Sizes */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Talla</h3>
          <div className="flex gap-2 flex-wrap">
            {['unitalla'].map((size) => (
              <button
                key={size}
                className="w-13 h-13 border rounded-full text-sm hover:border-black"
              >
                {size}
              </button>
            ))}
          </div>
          <a href="#" className="text-xs text-gray-500 mt-1 inline-block underline">
            Guía de tallas
          </a>
        </div>

        {/* Add to Cart */}
        <button
        onClick={handleAdd}
        className="bg-black text-white py-3 rounded-md mt-4 hover:bg-gray-900"
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
  );
}
