'use client';

import { useCart } from '../../context/CartContext';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [form, setForm] = useState({
    nombre: '',
    calle: '',
    colonia: '',
    ciudad: '',
    cp: '',
    email: '',
    telefono: '',
  });

  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef();

  // 🔧 FIXED: Proper stock update function
  const updateStock = async (cartItems) => {
    console.log('🔄 Starting stock update for:', cartItems);
    
    try {
      for (const item of cartItems) {
        console.log(`\n📦 Processing item: ${item.name}`);
        console.log(`🔢 Quantity to subtract: ${item.quantity}`);
        console.log(`📏 Selected size: ${item.selectedSize}`);

        // Check if the item has a selected size (anillos)
        if (item.selectedSize) {
          // Get current product data from database
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('sizes')
            .eq('id', item.id)
            .single();

          if (fetchError) {
            console.error('❌ Error fetching product:', fetchError);
            throw new Error(`No se pudo obtener el producto ${item.name}: ${fetchError.message}`);
          }

          console.log('📋 Current product data:', product);

          // Check if product has valid sizes array
          if (!product.sizes || !Array.isArray(product.sizes)) {
            throw new Error(`El producto ${item.name} no tiene tallas configuradas correctamente`);
          }

          console.log('🏷️ Current sizes:', product.sizes);

          // Update the specific size stock - ENSURE NUMBERS
          const updatedSizes = product.sizes.map(sizeObj => {
            if (sizeObj.size === item.selectedSize) {
              // 🔧 FIX: Ensure stock is treated as a number
              const currentStock = parseInt(sizeObj.stock);
              const quantityToSubtract = parseInt(item.quantity);
              const newStock = Math.max(0, currentStock - quantityToSubtract);
              
              console.log(`📊 Size ${sizeObj.size}: ${currentStock} -> ${newStock}`);
              
              // Verify we have valid numbers
              if (isNaN(currentStock) || isNaN(quantityToSubtract)) {
                throw new Error(`Stock inválido para la talla ${item.selectedSize} del producto ${item.name}`);
              }
              
              return {
                ...sizeObj,
                stock: newStock  // This will be a number
              };
            }
            return sizeObj;
          });

          console.log('🔄 Updated sizes:', updatedSizes);

          // Update the product in database
          const { error: updateError } = await supabase
            .from('products')
            .update({ sizes: updatedSizes })
            .eq('id', item.id);

          if (updateError) {
            console.error('❌ Error updating product stock:', updateError);
            throw new Error(`No se pudo actualizar el stock del producto ${item.name}: ${updateError.message}`);
          }

          console.log(`✅ Successfully updated stock for ${item.name} size ${item.selectedSize}`);
          
        } else {
          // For products without sizes (collares, etc.)
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (fetchError) {
            console.error('❌ Error fetching product:', fetchError);
            throw new Error(`No se pudo obtener el producto ${item.name}: ${fetchError.message}`);
          }

          // 🔧 FIX: Ensure stock is treated as a number
          const currentStock = parseInt(product.stock || 0);
          const quantityToSubtract = parseInt(item.quantity);
          const newStock = Math.max(0, currentStock - quantityToSubtract);
          
          if (isNaN(currentStock) || isNaN(quantityToSubtract)) {
            throw new Error(`Stock inválido para el producto ${item.name}`);
          }

          console.log(`📊 Product ${item.name}: ${currentStock} -> ${newStock}`);

          const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.id);

          if (updateError) {
            console.error('❌ Error updating general stock:', updateError);
            throw new Error(`No se pudo actualizar el stock del producto ${item.name}: ${updateError.message}`);
          }

          console.log(`✅ Successfully updated general stock for ${item.name}`);
        }
      }

      console.log('🎉 All stock updates completed successfully');
      return true;
    } catch (error) {
      console.error('💥 Stock update failed:', error);
      throw error; // Re-throw to be handled by onApprove
    }
  };

  // Function to save order to database
  const saveOrderToDatabase = async (orderData, paypalOrderId) => {
    try {
      const orderInsert = {
        paypal_order_id: paypalOrderId,
        customer_name: orderData.nombre,
        customer_email: orderData.email,
        customer_phone: orderData.telefono,
        shipping_address: {
          calle: orderData.calle,
          colonia: orderData.colonia,
          ciudad: orderData.ciudad,
          cp: orderData.cp,
        },
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          selected_size: item.selectedSize || null,
        })),
        total_amount: total,
        status: 'paid',
        created_at: new Date().toISOString(),
        is_guest: true,
      };

      console.log('🧾 Saving order to database:', orderInsert);

      const { data, error } = await supabase
        .from('orders')
        .insert([orderInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving order to database:', error);
        throw new Error('No se pudo guardar la orden en la base de datos');
      }

      console.log('✅ Order saved to database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in saveOrderToDatabase:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!showPayPal || paypalLoaded) return;

    // Avoid injecting the script more than once
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=MXN&components=buttons&intent=capture`;
    script.onload = () => {
      console.log('✅ PayPal SDK loaded');
      setPaypalLoaded(true);

      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: total.toFixed(2),
                    currency_code: 'MXN',
                  },
                  description: 'Pedido en Aceves Store',
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            try {
              // Capture the payment
              const order = await actions.order.capture();
              console.log('💰 Payment captured:', order);

              // 1. Update stock in database
              console.log('🔄 Starting stock update...');
              await updateStock(cart);
              console.log('✅ Stock updated successfully');

              // 2. Save order to database
              console.log('💾 Saving order to database...');
              const savedOrder = await saveOrderToDatabase(form, order.id);
              console.log('✅ Order saved successfully');

              // 3. Send to Google Sheets (existing flow)
              const productos = cart
                .map((item) => `${item.quantity}x ${item.name}${item.selectedSize ? ` (Talla: ${item.selectedSize})` : ''}`)
                .join(', ');

              const payload = {
                nombre: form.nombre,
                calle: form.calle,
                colonia: form.colonia,
                ciudad: form.ciudad,
                cp: form.cp,
                email: form.email,
                telefono: form.telefono,
                productos,
                total: total.toFixed(2),
                paypal_order_id: order.id
              };

              try {
                const response = await fetch(
                  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(payload),
                  }
                );

                const result = await response.text();
                console.log('📊 Google Sheets response:', result);

                if (result !== 'OK') {
                  console.warn('⚠️ Google Sheets did not respond OK, but order processed successfully');
                }
              } catch (gsheetError) {
                console.error('❌ Error sending to Google Sheets:', gsheetError);
                // Don't throw here, just log - Google Sheets failure shouldn't fail the order
              }

              // 4. Clear cart and redirect
              clearCart();
              toast.success(`✅ Payment completed for ${form.nombre} 🎉`);
              
              setTimeout(() => {
                window.location.href = `/gracias?nombre=${encodeURIComponent(form.nombre)}&orderId=${order.id}`;
              }, 1000);

              return order;
            } catch (error) {
              console.error('❌ Error in payment process:', error);
              toast.error(error.message || 'Error processing payment');
              throw error;
            }
          },
          onError: (err) => {
            console.error('❌ PayPal error:', err);
            toast.error('There was an error processing the payment.');
          },
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);
  }, [showPayPal, paypalLoaded, total, cart, form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, calle, colonia, ciudad, cp, email, telefono } = form;

    if (!nombre || !calle || !colonia || !ciudad || !cp || !email || !telefono) {
      toast.error('Please complete all fields.');
      return;
    }

    setShowPayPal(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Finalizar Pedido 🧾</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>Tu carrito está vacío.</p>
          <Link href="/" className="text-accent underline mt-4 inline-block">
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-2">
            {[
              ['Nombre Completo', 'nombre'],
              ['Calle y Número', 'calle'],
              ['Colonia', 'colonia'],
              ['Ciudad', 'ciudad'],
              ['Código Postal', 'cp'],
              ['Correo Electrónico', 'email'],
              ['Número de Celular', 'telefono'],
            ].map(([label, name]) => (
              <div key={name}>
                <label className="block font-medium">{label} *</label>
                <input
                  type={name === 'email' ? 'email' : 'text'}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Resumen del Pedido</h2>
            {cart.map((item, idx) => (
              <div key={idx} className="text-sm text-gray-700 mb-1">
                {item.quantity} x {item.name}
                {item.selectedSize && ` (Talla: ${item.selectedSize})`}
                {' — '}${(item.price * item.quantity).toLocaleString()} MXN
              </div>
            ))}
            <p className="mt-2 font-bold">Total: ${total.toLocaleString()} MXN</p>
          </div>

          {/* PayPal Area */}
          {!showPayPal && (
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-900"
            >
              Confirmar y Pagar con PayPal
            </button>
          )}

          {showPayPal && (
            <div className="pt-6">
              {!paypalLoaded && (
                <p className="text-sm text-gray-500">Cargando PayPal...</p>
              )}
              <div ref={paypalRef} />
            </div>
          )}
        </form>
      )}
    </div>
  );
}