/**
 * User Account Dashboard
 * Protected page showing user profile, stats, and recent orders
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function AccountDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cuenta');
      return;
    }

    fetchUserData();
  }, [isAuthenticated, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const profileRes = await fetch('/api/users/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Fetch recent orders (latest 5)
      const ordersRes = await fetch('/api/orders?limit=5');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mi Cuenta</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Información Personal</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Nombre:</span>
              <p className="font-medium text-gray-800">{profile?.nombre || 'No especificado'}</p>
            </div>
            <div>
              <span className="text-gray-500">Correo:</span>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Teléfono:</span>
              <p className="font-medium text-gray-800">{profile?.phone || 'No especificado'}</p>
            </div>
            <div>
              <span className="text-gray-500">Cliente desde:</span>
              <p className="font-medium text-gray-800">
                {profile?.customer_since
                  ? new Date(profile.customer_since).toLocaleDateString('es-MX')
                  : 'N/A'}
              </p>
            </div>
          </div>
          <Link
            href="/cuenta/perfil"
            className="mt-4 inline-block text-[#092536] hover:underline text-sm font-medium"
          >
            Editar perfil →
          </Link>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Estadísticas</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de pedidos:</span>
              <span className="text-2xl font-bold text-[#092536]">
                {profile?.total_orders || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total gastado:</span>
              <span className="text-2xl font-bold text-[#092536]">
                ${(profile?.total_spent || 0).toLocaleString()} MXN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/cuenta/pedidos"
          className="bg-[#092536] text-white text-center py-4 rounded-lg hover:bg-[#0a3a52] transition-colors font-medium"
        >
          Ver Todos los Pedidos
        </Link>
        <Link
          href="/cuenta/direcciones"
          className="bg-[#092536] text-white text-center py-4 rounded-lg hover:bg-[#0a3a52] transition-colors font-medium"
        >
          Gestionar Direcciones
        </Link>
        <Link
          href="/cuenta/perfil"
          className="bg-[#092536] text-white text-center py-4 rounded-lg hover:bg-[#0a3a52] transition-colors font-medium"
        >
          Editar Perfil
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Pedidos Recientes</h2>
          <Link
            href="/cuenta/pedidos"
            className="text-sm text-[#092536] hover:underline font-medium"
          >
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tienes pedidos aún.</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">
                      Pedido #{order.id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      ${order.total_amount.toLocaleString()} MXN
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${order.shipping_status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.shipping_status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {order.shipping_status === 'delivered'
                        ? 'Entregado'
                        : order.shipping_status === 'shipped'
                          ? 'Enviado'
                          : 'Pagado'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {order.items?.length || 0} artículo(s)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
