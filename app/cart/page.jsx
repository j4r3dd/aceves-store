'use client';

import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tiktokPixel } from '../../lib/tiktokPixel';

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    increaseQuantity, 
    decreaseQuantity,
    getAvailableStock 
  } = useCart();
  
  const [stockInfo, setStockInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Fetch stock info for all cart items
  useEffect(() => {
    const fetchStockInfo = async () => {
      setLoading(true);
      const stockData = {};
      
      for (const item of cart) {
        const key = `${item.id}-${item.selectedSize || 'no-size'}`;
        stockData[key] = await getAvailableStock(item.id, item.selectedSize);
      }
      
      setStockInfo(stockData);
      setLoading(false);
    };

    if (cart.length > 0) {
      fetchStockInfo();
    }
  }, [cart, getAvailableStock]);

  const getStockForItem = (item) => {
    const key = `${item.id}-${item.selectedSize || 'no-size'}`;
    return stockInfo[key] || 0;
  };

  const isQuantityAtMax = (item) => {
    const availableStock = getStockForItem(item);
    return item.quantity >= availableStock;
  };

  const handleCheckoutClick = () => {
    tiktokPixel.trackInitiateCheckout(cart);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Tu Carrito 🛒</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No hay productos en tu carrito.</p>
          <Link href="/" className="text-accent underline mt-4 inline-block">
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {cart.map((item, idx) => {
            const availableStock = getStockForItem(item);
            const isAtMax = isQuantityAtMax(item);
            
            return (
              <div key={`${item.id}-${item.selectedSize}`} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  
                  {/* Show size */}
                  {item.selectedSize && (
                    <p className="text-sm text-gray-500">Talla: {item.selectedSize}</p>
                  )}
                  
                  {/* Stock information */}
                  <p className="text-xs text-gray-500 mt-1">
                    {loading ? (
                      'Verificando stock...'
                    ) : (
                      `${availableStock} disponibles`
                    )}
                  </p>
                  
                  {/* Price and quantity */}
                  <p className="text-sm text-gray-600">
                    ${item.price} x {item.quantity} = ${(item.price * item.quantity).toLocaleString()} MXN
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                      className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                      disabled={loading}
                    >
                      −
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => increaseQuantity(item.id, item.selectedSize)}
                      className={`px-2 py-1 text-sm border rounded ${
                        isAtMax || loading
                          ? 'opacity-50 cursor-not-allowed bg-gray-100'
                          : 'hover:bg-gray-100'
                      }`}
                      disabled={isAtMax || loading}
                      title={isAtMax ? `Solo hay ${availableStock} disponibles` : ''}
                    >
                      +
                    </button>
                  </div>

                  {/* Warning if quantity exceeds stock */}
                  {item.quantity > availableStock && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ Cantidad excede stock disponible
                    </p>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="text-red-600 text-sm mt-2 hover:underline block"
                  >
                    Quitar
                  </button>
                </div>

                {/* Product image */}
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-20 h-20 object-contain rounded"
                />
              </div>
            );
          })}

          <div className="flex justify-between pt-6 border-t text-lg font-semibold">
            <p>Total:</p>
            <p>${total.toLocaleString()} MXN</p>
          </div>

          <Link href="/checkout">
            <button 
              onClick={handleCheckoutClick}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-900">
              Proceder al pago
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}