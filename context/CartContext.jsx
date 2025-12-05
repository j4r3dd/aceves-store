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
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fixed getAvailableStock function - add this to your CartContext

  // Helper function to get available stock for a product/size
  const getAvailableStock = async (productId, selectedSize = null) => {
    try {
      console.log(`🔍 Checking stock for product ${productId}, size: ${selectedSize}`);
      
      const { data: product, error } = await supabase
        .from('products')
        .select('*') // Select all fields to see the full product structure
        .eq('id', productId)
        .single();

      if (error) {
        console.error('❌ Error fetching product stock:', error);
        return 0;
      }

      if (!product) {
        console.error('❌ Product not found:', productId);
        return 0;
      }

      console.log('📦 Product data:', product);

      // If the product has a selectedSize, check the sizes array
      if (selectedSize && product.sizes && Array.isArray(product.sizes)) {
        console.log('🏷️ Product has sizes, looking for size:', selectedSize);
        console.log('🏷️ Available sizes:', product.sizes);
        
        const sizeData = product.sizes.find(s => s.size === selectedSize);
        
        if (sizeData) {
          const stock = parseInt(sizeData.stock) || 0;
          console.log(`📊 Stock for size ${selectedSize}:`, stock);
          return stock;
        } else {
          console.warn(`❌ Size ${selectedSize} not found in product sizes`);
          return 0;
        }
      } 
      // If no selectedSize or no sizes array, check general stock
      else if (product.stock !== undefined) {
        const stock = parseInt(product.stock) || 0;
        console.log('📊 General product stock:', stock);
        return stock;
      }
      // If product has sizes but no selectedSize was provided, return 0
      else if (product.sizes && Array.isArray(product.sizes)) {
        console.warn('❌ Product has sizes but no size was selected');
        return 0;
      }
      // Fallback: assume stock is available if no stock field is found
      else {
        console.warn('⚠️ No stock information found, assuming available');
        return 999; // Assume high stock if no stock management
      }
    } catch (error) {
      console.error('❌ Exception checking stock:', error);
      return 0;
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
    // Check available stock before adding
    const availableStock = await getAvailableStock(product.id, product.selectedSize);
    
    if (availableStock <= 0) {
      toast.error('❌ Producto agotado');
      return;
    }

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