/**
 * Admin Order Management Page
 * Allows admins to view and manage all orders
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Order {
  id: string;
  paypal_order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  original_total?: number;
  coupon_code?: string;
  coupon_discount?: number;
  user_discount?: number;
  shipping_status: 'paid' | 'shipped' | 'delivered';
  tracking_number?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    selected_size?: string;
  }>;
  shipping_address: {
    calle: string;
    colonia: string;
    ciudad: string;
    cp: string;
    pais: string;
  };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === 'all'
          ? '/api/admin/orders'
          : `/api/admin/orders?status=${statusFilter}`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401 || response.status === 403) {
        toast.error('No autorizado. Inicia sesión como administrador.');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'paid' | 'shipped' | 'delivered',
    trackingNumber?: string
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          tracking_number: trackingNumber || undefined,
        }),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Estado actualizado a: ${getStatusText(newStatus)}`);
        if (newStatus === 'shipped') {
          toast.info('Se envió un correo de notificación al cliente');
        }
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const getStatusBadgeClass = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="text-blue-600 hover:underline text-sm font-medium mb-2 inline-block">
          ← Volver al Panel Admin
        </Link>
        <h1 className="text-3xl font-bold mb-4">Gestión de Pedidos</h1>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'paid'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Pagados
          </button>
          <button
            onClick={() => setStatusFilter('shipped')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'shipped'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Enviados
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'delivered'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'No hay pedidos en el sistema.'
              : `No hay pedidos con estado "${getStatusText(statusFilter)}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md">
              {/* Order Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">
                        Pedido #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(
                          order.shipping_status
                        )}`}
                      >
                        {getStatusText(order.shipping_status)}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p>
                          <strong>Cliente:</strong> {order.customer_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {order.customer_email}
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Fecha:</strong>{' '}
                          {new Date(order.created_at).toLocaleDateString('es-MX')}
                        </p>
                        <p>
                          <strong>Total:</strong> ${order.total_amount.toLocaleString()} MXN
                        </p>
                      </div>
                      <div>
                        <p>
                          <strong>Artículos:</strong> {order.items?.length || 0}
                        </p>
                        {order.tracking_number && (
                          <p>
                            <strong>Rastreo:</strong> {order.tracking_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 ml-4">
                    {expandedOrder === order.id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Order Details (Expanded) */}
              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Artículos del Pedido</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white p-3 rounded">
                            <p className="font-medium">
                              {item.quantity}x {item.product_name}
                              {item.selected_size && (
                                <span className="text-gray-500"> (Talla: {item.selected_size})</span>
                              )}
                            </p>
                            <p className="text-gray-600">${item.price.toLocaleString()} MXN</p>
                          </div>
                        ))}
                      </div>

                      {/* Price Breakdown */}
                      <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                        {order.original_total && order.original_total !== order.total_amount && (
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal original:</span>
                            <span>${order.original_total.toLocaleString()} MXN</span>
                          </div>
                        )}
                        {order.coupon_discount && order.coupon_discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Cupón ({order.coupon_code}):</span>
                            <span>-${order.coupon_discount.toLocaleString()} MXN</span>
                          </div>
                        )}
                        {order.user_discount && order.user_discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Descuento de usuario:</span>
                            <span>-${order.user_discount.toLocaleString()} MXN</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span>${order.total_amount.toLocaleString()} MXN</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold mb-3">Dirección de Envío</h4>
                      <div className="bg-white p-4 rounded text-sm">
                        <p className="font-medium">{order.customer_name}</p>
                        <p>{order.shipping_address?.calle}</p>
                        <p>{order.shipping_address?.colonia}</p>
                        <p>
                          {order.shipping_address?.ciudad}, CP {order.shipping_address?.cp}
                        </p>
                        <p>{order.shipping_address?.pais}</p>
                        <p className="pt-2">{order.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Update Controls */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-3">Actualizar Estado del Pedido</h4>
                    <div className="flex flex-wrap gap-3">
                      {order.shipping_status === 'paid' && (
                        <ShippingForm
                          orderId={order.id}
                          onUpdate={(trackingNumber) =>
                            handleUpdateStatus(order.id, 'shipped', trackingNumber)
                          }
                        />
                      )}

                      {order.shipping_status === 'shipped' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Marcar como Entregado
                        </button>
                      )}

                      {order.shipping_status === 'delivered' && (
                        <p className="text-green-600 font-medium">
                          ✓ Pedido completado - Entregado el{' '}
                          {order.delivered_at
                            ? new Date(order.delivered_at).toLocaleDateString('es-MX')
                            : 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shipping Form Component
function ShippingForm({
  orderId,
  onUpdate,
}: {
  orderId: string;
  onUpdate: (trackingNumber: string) => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      onUpdate(trackingNumber.trim());
      setTrackingNumber('');
      setShowInput(false);
    }
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Marcar como Enviado
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
        placeholder="Número de rastreo (opcional)"
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Enviar
      </button>
      <button
        type="button"
        onClick={() => setShowInput(false)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancelar
      </button>
    </form>
  );
}
