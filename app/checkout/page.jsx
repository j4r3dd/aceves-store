'use client';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { tiktokPixel } from '../../lib/tiktokPixel';
import CouponInput from '../components/CouponInput';

export default function CheckoutPage() {
  const { cart, clearCart, hasEnvioCruzadoProducts } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Coupon and discount state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [userDiscount, setUserDiscount] = useState(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discounts
  const couponDiscount = appliedCoupon?.discount || 0;
  const subtotalAfterDiscounts = subtotal - couponDiscount - userDiscount;

  // Shipping fee logic: $1 MXN if subtotal (after discounts) is less than $999 MXN
  const FREE_SHIPPING_THRESHOLD = 999;
  const SHIPPING_FEE = 1;
  const shippingCost = subtotalAfterDiscounts < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const total = subtotalAfterDiscounts + shippingCost;

  const [form, setForm] = useState({
    nombre: '',
    calle: '',
    colonia: '',
    ciudad: '',
    cp: '',
    pais: 'México',
    email: '',
    telefono: '',
  });

  const [showPayPal, setShowPayPal] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Prevent double-capture
  const paypalRef = useRef();

  // NEW STATE VARIABLES FOR ENVIO CRUZADO
  const [envioCruzadoEnabled, setEnvioCruzadoEnabled] = useState(false);
  const [secondaryAddress, setSecondaryAddress] = useState({
    calle: '',
    colonia: '',
    ciudad: '',
    cp: '',
    pais: 'México',
  });
  const [address1Notes, setAddress1Notes] = useState('');
  const [address2Notes, setAddress2Notes] = useState('');

  // 🔧 NEW: Use API route for stock updates (bypasses RLS with service key)
  const updateStock = async (cartItems) => {
    console.log('🔄 Starting stock update via API for:', cartItems);

    try {
      const response = await fetch('/api/update-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update stock');
      }

      if (!result.success) {
        throw new Error(result.error || 'Stock update was not successful');
      }

      console.log('✅ Stock updated successfully via API');
      return true;
    } catch (error) {
      console.error('❌ API stock update failed:', error);
      throw error;
    }
  };

  // Track InitiateCheckout when page loads
  useEffect(() => {
    if (cart.length > 0 && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: cart.map(item => item.id),
        contents: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price
        })),
        currency: 'MXN',
        num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        value: subtotal
      });
    }
  }, []); // Only run once on mount

  // Pre-fill form with user's default address if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch('/api/addresses')
        .then((res) => res.json())
        .then((addresses) => {
          const defaultAddr = addresses.find((addr) => addr.is_default) || addresses[0];
          if (defaultAddr) {
            setForm({
              nombre: defaultAddr.nombre || '',
              calle: defaultAddr.calle || '',
              colonia: defaultAddr.colonia || '',
              ciudad: defaultAddr.ciudad || '',
              cp: defaultAddr.cp || '',
              pais: defaultAddr.pais || 'México',
              email: user.email || '',
              telefono: defaultAddr.telefono || '',
            });
          } else {
            // No saved address, just pre-fill email
            setForm((prev) => ({ ...prev, email: user.email || '' }));
          }
        })
        .catch((err) => console.error('Error fetching addresses:', err));

      // Fetch user's active discount
      fetch('/api/users/discount')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.discount_value) {
            const discount =
              data.discount_type === 'percentage'
                ? (subtotal * data.discount_value) / 100
                : data.discount_value;
            setUserDiscount(Math.min(discount, subtotal));
          }
        })
        .catch((err) => console.error('Error fetching user discount:', err));
    }
  }, [isAuthenticated, user, subtotal]);

  // Function to save order to database
  const saveOrderToDatabase = async (orderData, paypalOrderId) => {
    try {
      const orderInsert = {
        paypal_order_id: paypalOrderId,
        user_id: isAuthenticated && user ? user.id : null,
        customer_name: orderData.nombre,
        customer_email: orderData.email,
        customer_phone: orderData.telefono,
        shipping_address: {
          calle: orderData.calle,
          colonia: orderData.colonia,
          ciudad: orderData.ciudad,
          cp: orderData.cp,
          pais: orderData.pais,
        },
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          selected_size: item.selectedSize || null,
        })),
        total_amount: total,
        original_total: subtotal,
        coupon_code: appliedCoupon?.coupon?.code || null,
        coupon_discount: couponDiscount,
        user_discount: userDiscount,
        status: 'paid',
        shipping_status: 'paid',
        created_at: new Date().toISOString(),
        is_guest: !isAuthenticated,
        // NEW FIELDS FOR ENVIO CRUZADO
        is_envio_cruzado: envioCruzadoEnabled,
        ...(envioCruzadoEnabled && {
          secondary_shipping_address: secondaryAddress,
          address_1_notes: address1Notes,
          address_2_notes: address2Notes,
        }),
      };

      console.log('🧾 Saving order to database via API:', orderInsert);

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderInsert),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error saving order to database (API):', result.error);
        throw new Error(result.error || 'No se pudo guardar la orden en la base de datos');
      }

      console.log('✅ Order saved to database:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in saveOrderToDatabase:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!showPayPal || paypalLoaded) return;

    // Avoid injecting the script more than once
    if (document.getElementById('paypal-sdk')) return;

    // Use sandbox for development, production API for production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const paypalClientId = isDevelopment
      ? process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=MXN&components=buttons&intent=capture`;
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
            // Prevent double-capture
            if (isProcessing) {
              console.log('⚠️ Payment already processing, ignoring duplicate');
              return;
            }
            setIsProcessing(true);

            try {
              // Track AddPaymentInfo event when PayPal is approved - TikTok
              await tiktokPixel.trackAddPaymentInfoEnhanced(cart, {
                email: form.email,
                phone: form.telefono
              });

              // Track AddPaymentInfo event - Meta Pixel
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'AddPaymentInfo', {
                  content_ids: cart.map(item => item.id),
                  contents: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    item_price: item.price
                  })),
                  currency: 'MXN',
                  value: total
                });
              }

              // Capture the payment
              console.log('🔄 Attempting to capture order...');
              const order = await actions.order.capture();
              console.log('💰 Payment captured:', order);

              // Verify capture was successful
              if (order.status !== 'COMPLETED') {
                throw new Error(`Payment not completed. Status: ${order.status}`);
              }

              // 1. Update stock in database
              console.log('🔄 Starting stock update...');
              await updateStock(cart);
              console.log('✅ Stock updated successfully');

              // 2. Save order to database
              console.log('💾 Saving order to database...');
              const savedOrder = await saveOrderToDatabase(form, order.id);
              console.log('✅ Order saved successfully');

              // 3. Track Purchase event - TikTok
              await tiktokPixel.trackPurchaseEnhanced({
                email: form.email,
                phone: form.telefono,
                orderId: order.id,
                items: cart,
                total: total
              }, {
                email: form.email,
                phone: form.telefono
              });

              // 3b. Track Purchase event - Meta Pixel
              if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                  content_ids: cart.map(item => item.id),
                  contents: cart.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    item_price: item.price
                  })),
                  content_type: 'product',
                  currency: 'MXN',
                  value: total
                });
              }

              // 4. Send to Google Sheets (existing flow)
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

              // Reset envio cruzado state
              setEnvioCruzadoEnabled(false);
              setSecondaryAddress({ calle: '', colonia: '', ciudad: '', cp: '', pais: 'México' });
              setAddress1Notes('');
              setAddress2Notes('');

              toast.success(`✅ Payment completed for ${form.nombre} 🎉`);

              setTimeout(() => {
                window.location.href = `/gracias?nombre=${encodeURIComponent(form.nombre)}&orderId=${order.id}`;
              }, 1000);

              return order;
            } catch (error) {
              console.error('❌ Error in payment process:', error);
              setIsProcessing(false); // Reset so user can retry

              // Handle specific PayPal errors
              if (error?.message?.includes('422') || error?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
                toast.error('Este pago ya fue procesado. Si no ves tu confirmación, contacta soporte.');
              } else if (error?.message?.includes('ORDER_NOT_APPROVED')) {
                toast.error('El pago no fue aprobado. Por favor intenta de nuevo.');
              } else {
                toast.error(error.message || 'Error al procesar el pago. Intenta de nuevo.');
              }
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

    script.onerror = () => {
      console.error('❌ PayPal SDK failed to load');
      toast.error('No se pudo cargar PayPal. Por favor revisa tu conexión o desactiva bloqueadores de anuncios.');
    };

    document.body.appendChild(script);
  }, [showPayPal, paypalLoaded, total, cart, form, isProcessing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSecondaryAddressChange = (e) => {
    setSecondaryAddress({ ...secondaryAddress, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, calle, colonia, ciudad, cp, pais, email, telefono } = form;

    // Validate primary customer info and address
    if (!nombre || !calle || !colonia || !ciudad || !cp || !pais || !email || !telefono) {
      toast.error('Por favor completa todos los campos de información personal y dirección principal.');
      return;
    }

    // Validate secondary address if envio cruzado is enabled
    if (envioCruzadoEnabled) {
      const { calle: calle2, colonia: colonia2, ciudad: ciudad2, cp: cp2, pais: pais2 } = secondaryAddress;

      if (!calle2 || !colonia2 || !ciudad2 || !cp2 || !pais2) {
        toast.error('Por favor completa todos los campos de la dirección secundaria.');
        return;
      }

      if (!address1Notes.trim()) {
        toast.error('Por favor especifica qué artículo va a la Dirección 1.');
        return;
      }

      if (!address2Notes.trim()) {
        toast.error('Por favor especifica qué artículo va a la Dirección 2.');
        return;
      }
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
                  inputMode={name === 'cp' || name === 'telefono' ? 'numeric' : undefined}
                  pattern={name === 'cp' || name === 'telefono' ? '[0-9]*' : undefined}
                  maxLength={name === 'cp' ? 5 : name === 'telefono' ? 10 : undefined}
                  onKeyDown={name === 'cp' || name === 'telefono' ? (e) => {
                    if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      e.preventDefault();
                    }
                  } : undefined}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            ))}

            {/* País Field */}
            <div>
              <label className="block font-medium">País *</label>
              <select
                name="pais"
                value={form.pais}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 bg-white"
              >
                <option value="México">México</option>
              </select>
            </div>
          </div>

          {/* NEW: ENVIO CRUZADO SECTION */}
          {hasEnvioCruzadoProducts() && (
            <div className="border-t pt-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={envioCruzadoEnabled}
                  onChange={(e) => setEnvioCruzadoEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="font-medium text-lg text-white">
                  Envío Cruzado - Enviar a 2 direcciones diferentes
                </span>
              </label>

              {envioCruzadoEnabled && (
                <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                  {/* Address 1 Notes */}
                  <div>
                    <h3 className="font-semibold mb-2 text-black">Dirección 1 (Arriba)</h3>
                    <p className="text-sm mb-2 text-black">
                      Calle: {form.calle}, {form.colonia}, {form.ciudad}, CP: {form.cp}, {form.pais}
                    </p>
                    <label className="block font-medium mb-1 text-black">
                      ¿Qué artículo va a esta dirección? *
                    </label>
                    <textarea
                      value={address1Notes}
                      onChange={(e) => setAddress1Notes(e.target.value)}
                      placeholder="Ej: Anillo para mujer"
                      className="w-full border rounded px-3 py-2 h-20"
                      required={envioCruzadoEnabled}
                    />
                  </div>

                  {/* Address 2 Section */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3 text-black">Dirección 2</h3>

                    {/* Secondary Address Fields */}
                    {[
                      ['Calle y Número', 'calle'],
                      ['Colonia', 'colonia'],
                      ['Ciudad', 'ciudad'],
                      ['Código Postal', 'cp'],
                    ].map(([label, name]) => (
                      <div key={name} className="mb-2">
                        <label className="block font-medium text-black">{label} *</label>
                        <input
                          type="text"
                          name={name}
                          value={secondaryAddress[name]}
                          onChange={handleSecondaryAddressChange}
                          required={envioCruzadoEnabled}
                          inputMode={name === 'cp' ? 'numeric' : undefined}
                          pattern={name === 'cp' ? '[0-9]*' : undefined}
                          maxLength={name === 'cp' ? 5 : undefined}
                          onKeyDown={name === 'cp' ? (e) => {
                            if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                              e.preventDefault();
                            }
                          } : undefined}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    ))}

                    {/* País Field for Secondary Address */}
                    <div className="mb-2">
                      <label className="block font-medium text-black">País *</label>
                      <select
                        name="pais"
                        value={secondaryAddress.pais}
                        onChange={handleSecondaryAddressChange}
                        required={envioCruzadoEnabled}
                        className="w-full border rounded px-3 py-2 bg-white"
                      >
                        <option value="México">México</option>
                      </select>
                    </div>

                    {/* Address 2 Notes */}
                    <div className="mt-3">
                      <label className="block font-medium mb-1 text-black">
                        ¿Qué artículo va a esta dirección? *
                      </label>
                      <textarea
                        value={address2Notes}
                        onChange={(e) => setAddress2Notes(e.target.value)}
                        placeholder="Ej: Anillo para hombre"
                        className="w-full border rounded px-3 py-2 h-20"
                        required={envioCruzadoEnabled}
                      />
                    </div>
                  </div>

                  {/* Informational Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                    <p className="font-medium mb-1">Nota importante:</p>
                    <p>
                      El costo de envío se aplica una sola vez. Ambas direcciones recibirán su artículo
                      en el mismo plazo de entrega.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Login Prompt */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>¿Ya tienes cuenta?</strong>{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Inicia sesión
                </Link>{' '}
                para acceder a descuentos exclusivos y ver tus pedidos anteriores.
              </p>
            </div>
          )}

          {/* Coupon Input Section */}
          <CouponInput
            cartTotal={subtotal}
            onCouponApplied={(couponData) => setAppliedCoupon(couponData)}
          />

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
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()} MXN</span>
              </div>

              {/* Coupon Discount Display */}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento por cupón ({appliedCoupon?.coupon?.code}):</span>
                  <span>-${couponDiscount.toLocaleString()} MXN</span>
                </div>
              )}

              {/* User Discount Display */}
              {userDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento de usuario:</span>
                  <span>-${userDiscount.toLocaleString()} MXN</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío:</span>
                {shippingCost > 0 ? (
                  <span>${shippingCost.toLocaleString()} MXN</span>
                ) : (
                  <span className="text-green-600">Gratis</span>
                )}
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-gray-500">
                  Envío gratis en compras mayores a ${FREE_SHIPPING_THRESHOLD.toLocaleString()} MXN
                </p>
              )}
            </div>
            <p className="mt-3 pt-2 border-t font-bold text-lg">Total: ${total.toLocaleString()} MXN</p>

            {/* Savings Summary */}
            {(couponDiscount > 0 || userDiscount > 0) && (
              <p className="text-sm text-green-600 mt-2">
                Ahorraste ${(couponDiscount + userDiscount).toLocaleString()} MXN 🎉
              </p>
            )}
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