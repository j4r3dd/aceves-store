'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Leer carrito guardado en localStorage al iniciar
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const increaseQuantity = (id, selectedSize) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );

    toast.success('Cantidad aumentada 🛒');
  };

  const decreaseQuantity = (id, selectedSize) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );

    toast.info('Cantidad disminuida');
  };

  const addToCart = (product) => {
    let wasUpdated = false;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existing) {
        wasUpdated = true;
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    if (wasUpdated) {
      toast.success('Cantidad actualizada en el carrito 🛒');
    } else {
      toast.success('Producto agregado al carrito 🎉');
    }
  };

  const removeFromCart = (id, selectedSize) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.selectedSize === selectedSize)
      )
    );

    toast.error('Producto eliminado del carrito ❌');
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
