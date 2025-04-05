'use client';

import { useCart } from '../../context/CartContext';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart } = useCart();
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

  useEffect(() => {
    if (!showPayPal || paypalLoaded) return;

    // Avoid double-injection
    if (document.getElementById('paypal-sdk')) return;

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = "https://www.paypal.com/sdk/js?client-id=Ad8bdQOXCXQq6itgPUhkh3C3xuUIuWORQyuPfQ8YGgf1IRz5IzNix1hutXurVnnBdxKktPKaPl_wj-7I&currency=MXN&components=buttons&intent=capture";
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
            const order = await actions.order.capture();
          
            // Format cart items as text
            const productos = cart
              .map((item) => `${item.quantity}x ${item.name}`)
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
            };
          
            // Send to Google Sheets
            try {
              const response = await fetch("https://script.google.com/macros/s/AKfycby6assVWNvYclql3DxL_MqLIDfv0GgPW7PXbsdEYez93r9RAVFTJ2lE3t2ebqdeXw/exec", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(payload),
              });
              
              const result = await response.text();
              console.log("Respuesta del servidor:", result);
              
              if (result === "OK") {
                alert(`✅ Pago completado por ${form.nombre} 🎉`);
                console.log("🧾 Pedido enviado a Google Sheets.");
              } else {
                throw new Error("La respuesta del servidor no fue OK");
              }
            } catch (err) {
              console.error("❌ Error al enviar a Google Sheets:", err);
              alert("El pago fue exitoso, pero no se pudo guardar el pedido.");
            }
      
          },
          
          onError: (err) => {
            console.error('❌ Error en PayPal:', err);
            alert('Hubo un error al procesar el pago.');
          },
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);
  }, [showPayPal, paypalLoaded, total, form.nombre]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { nombre, calle, colonia, ciudad, cp, email, telefono } = form;

    if (!nombre || !calle || !colonia || !ciudad || !cp || !email || !telefono) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setShowPayPal(true); // load buttons
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
              <p key={idx} className="text-sm text-gray-700">
                {item.quantity} x {item.name} — ${item.price * item.quantity} MXN
              </p>
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
