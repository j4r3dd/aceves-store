'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Read cart from localStorage on initialization
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    console.log('💾 Saving cart to localStorage:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fixed getAvailableStock function - add this to your CartContext

  // Helper function to get available stock for a product/size
  // Helper function to get available stock for a product/size
  // Helper function to get available stock for a product/size
  // Helper function to get available stock for a product/size
  const getAvailableStock = async (productId, selectedSize = null, fallbackProduct = null) => {
    const MAX_RETRIES = 3;
    const TIMEOUT_MS = 10000; // 10 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔍 Checking stock via API for product ${productId}, size: ${selectedSize} (Attempt ${attempt}/${MAX_RETRIES})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        let url = `/api/products/stock?id=${productId}`;
        if (selectedSize) {
          url += `&size=${encodeURIComponent(selectedSize)}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API Stock Check failed: ${response.status} ${response.statusText}`, errorText);
          // If 404, product truly gone
          if (response.status === 404) return 0;
          // If 500 or other, maybe retry
          if (attempt === MAX_RETRIES) break;
          continue;
        }

        const data = await response.json();
        console.log(`📊 API Stock response:`, data);

        return data.stock;

      } catch (error) {
        console.error(`❌ Exception checking stock attempt ${attempt}:`, error);
        if (error.name === 'AbortError') {
          console.warn('⏱️ API Request timed out');
        }
        if (attempt === MAX_RETRIES) break;
      }
    }

    // Fallback logic
    if (fallbackProduct) {
      console.warn('⚠️ All stock checks failed. Using fallback product data from client.');
      return extractStockFromProduct(fallbackProduct, selectedSize);
    }

    return 0;
  };

  // Helper to extract stock regardless of source
  const extractStockFromProduct = (product, selectedSize) => {
    if (selectedSize && product.sizes && Array.isArray(product.sizes)) {
      const sizeData = product.sizes.find(s => s.size === selectedSize);
      if (sizeData) {
        const stock = parseInt(sizeData.stock) || 0;
        console.log(`📊 Stock for size ${selectedSize}:`, stock);
        return stock;
      } else {
        console.warn(`❌ Size ${selectedSize} not found in product sizes`);
        return 0;
      }
    } else if (product.stock !== undefined) {
      const stock = parseInt(product.stock) || 0;
      console.log('📊 General product stock:', stock);
      return stock;
    } else if (product.sizes && Array.isArray(product.sizes)) {
      console.warn('❌ Product has sizes but no size was selected');
      return 0;
    } else {
      console.warn('⚠️ No stock information found, assuming available');
      return 999;
    }
  };



  const increaseQuantity = async (id, selectedSize) => {
    // First, check available stock
    const availableStock = await getAvailableStock(id, selectedSize);

    // Get current quantity in cart
    const currentItem = cart.find(item =>
      item.id === id && item.selectedSize === selectedSize
    );
    const currentQuantity = currentItem ? currentItem.quantity : 0;

    // Check if we can add one more
    if (currentQuantity >= availableStock) {
      toast.error(`❌ Solo hay ${availableStock} disponibles de este producto`);
      return;
    }

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

  const addToCart = async (product) => {
    console.log('🛒 addToCart called with:', { id: product.id, selectedSize: product.selectedSize });

    // Check available stock before adding
    // Pass the product as fallback
    const availableStock = await getAvailableStock(product.id, product.selectedSize, product);
    console.log('📊 Available stock:', availableStock);

    if (availableStock <= 0) {
      console.log('❌ Stock is 0 or less, showing error');
      toast.error('❌ Producto agotado');
      return;
    }

    console.log('✅ Stock available, proceeding to add to cart');

    let wasUpdated = false;
    let newQuantity = 1;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existing) {
        newQuantity = existing.quantity + 1;

        // Check if new quantity exceeds stock
        if (newQuantity > availableStock) {
          toast.error(`❌ Solo hay ${availableStock} disponibles de este producto`);
          return prev; // Return unchanged cart
        }

        wasUpdated = true;
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Adding new item
      if (availableStock < 1) {
        toast.error('❌ Producto agotado');
        return prev;
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    console.log('🔄 Cart state updated, wasUpdated:', wasUpdated);

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

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
    toast.info('Carrito vaciado 🛒');
  };

  // Validate cart against current stock (useful for checkout)
  const validateCartStock = async () => {
    const validationErrors = [];

    for (const item of cart) {
      const availableStock = await getAvailableStock(item.id, item.selectedSize);

      if (item.quantity > availableStock) {
        validationErrors.push({
          item,
          availableStock,
          requestedQuantity: item.quantity
        });
      }
    }

    return validationErrors;
  };

  // Check if cart contains any envio_cruzado products
  const hasEnvioCruzadoProducts = () => {
    return cart.some(item => item.envio_cruzado === true);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        validateCartStock,
        getAvailableStock,
        hasEnvioCruzadoProducts
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);