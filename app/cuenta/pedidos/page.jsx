/**
 * Order History Page
 * Shows all user orders with detailed information
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cuenta/pedidos');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Error fetching orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'shipped':
        return 'Enviado';
      case 'paid':
        return 'Pagado';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cuenta"
          className="text-[#092536] hover:underline text-sm font-medium mb-2 inline-block"
        >
          ← Volver a Mi Cuenta
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Historial de Pedidos</h1>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes pedidos aún.</p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-[#092536] text-white rounded-lg hover:bg-[#0a3a52] transition-colors"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Order Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    Pedido #{order.id.substring(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fecha: {new Date(order.created_at).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {order.paypal_order_id && (
                    <p className="text-xs text-gray-400 mt-1">
                      PayPal ID: {order.paypal_order_id}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                    order.shipping_status
                  )}`}
                >
                  {getStatusText(order.shipping_status)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Artículos</h3>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">{item.quantity}x</span> {item.product_name}
                        {item.selected_size && (
                          <span className="text-gray-500"> (Talla: {item.selected_size})</span>
                        )}
                        <div className="text-gray-600">
                          ${item.price.toLocaleString()} MXN
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-1 text-sm">
                    {order.original_total && order.original_total !== order.total_amount && (
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal original:</span>
                        <span>${order.original_total.toLocaleString()} MXN</span>
                      </div>
                    )}
                    {order.coupon_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento por cupón ({order.coupon_code}):</span>
                        <span>-${order.coupon_discount.toLocaleString()} MXN</span>
                      </div>
                    )}
                    {order.user_discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento de usuario:</span>
                        <span>-${order.user_discount.toLocaleString()} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span>${order.total_amount.toLocaleString()} MXN</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Shipping Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Información de Envío</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-medium">{order.customer_name}</p>
                    <p>{order.shipping_address?.calle}</p>
                    <p>{order.shipping_address?.colonia}</p>
                    <p>
                      {order.shipping_address?.ciudad}, CP {order.shipping_address?.cp}
                    </p>
                    <p>{order.shipping_address?.pais}</p>
                    <p className="pt-2">{order.customer_email}</p>
                    <p>{order.customer_phone}</p>
                  </div>

                  {/* Tracking Number */}
                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-800 mb-1">
                        Número de Rastreo:
                      </p>
                      <p className="text-sm text-blue-600 font-mono">
                        {order.tracking_number}
                      </p>
                    </div>
                  )}

                  {/* Shipping Dates */}
                  {(order.shipped_at || order.delivered_at) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-1">
                      {order.shipped_at && (
                        <p>
                          <span className="font-medium">Enviado:</span>{' '}
                          {new Date(order.shipped_at).toLocaleDateString('es-MX')}
                        </p>
                      )}
                      {order.delivered_at && (
                        <p>
                          <span className="font-medium">Entregado:</span>{' '}
                          {new Date(order.delivered_at).toLocaleDateString('es-MX')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
