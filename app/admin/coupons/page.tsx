/**
 * Admin Coupon Management Page
 * Allows admins to create and manage discount coupons
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_purchase_amount: 0,
    max_uses: null as number | null,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons');

      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      } else if (response.status === 401) {
        toast.error('No autorizado. Inicia sesión como administrador.');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Error al cargar los cupones');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? null
              : parseFloat(value)
            : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error('El código del cupón es requerido');
      return;
    }

    if (formData.discount_value <= 0) {
      toast.error('El valor del descuento debe ser mayor a 0');
      return;
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      toast.error('El descuento porcentual no puede ser mayor a 100%');
      return;
    }

    try {
      const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
      const method = editingId ? 'PUT' : 'POST';

      // Prepare payload
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        valid_until: formData.valid_until || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingId ? 'Cupón actualizado' : 'Cupón creado correctamente');
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchCoupons();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el cupón');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Error al guardar el cupón');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_purchase_amount: coupon.min_purchase_amount,
      max_uses: coupon.max_uses,
      valid_from: coupon.valid_from.split('T')[0],
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        toast.success(currentStatus ? 'Cupón desactivado' : 'Cupón activado');
        fetchCoupons();
      } else {
        toast.error('Error al actualizar el cupón');
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Error al actualizar el cupón');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Cupón eliminado');
        fetchCoupons();
      } else {
        toast.error('Error al eliminar el cupón');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Error al eliminar el cupón');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_purchase_amount: 0,
      max_uses: null,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500">Cargando cupones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="text-blue-600 hover:underline text-sm font-medium mb-2 inline-block">
          ← Volver al Panel Admin
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Cupón
            </button>
          )}
        </div>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Código del Cupón <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 uppercase"
                  placeholder="VERANO2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Descuento <span className="text-red-500">*</span>
                </label>
                <select
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 bg-white"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Cantidad Fija (MXN)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Valor del Descuento <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.discount_type === 'percentage'
                    ? 'Ej: 10 para 10% de descuento'
                    : 'Ej: 100 para $100 MXN de descuento'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compra Mínima (MXN)</label>
                <input
                  type="number"
                  name="min_purchase_amount"
                  value={formData.min_purchase_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monto mínimo de compra requerido (0 = sin mínimo)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
                rows={2}
                placeholder="Descuento de verano 2025"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Válido Desde <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Válido Hasta</label>
                <input
                  type="date"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío = sin fecha límite</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usos Máximos</label>
                <input
                  type="number"
                  name="max_uses"
                  value={formData.max_uses || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Ilimitado"
                />
                <p className="text-xs text-gray-500 mt-1">Dejar vacío = ilimitado</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="is_active" className="text-sm">
                Cupón activo (los clientes pueden usarlo)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {editingId ? 'Actualizar Cupón' : 'Crear Cupón'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No hay cupones creados.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear primer cupón
              </button>
            )}
          </div>
        ) : (
          coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white rounded-lg shadow-md p-6 ${!coupon.is_active ? 'opacity-60' : ''
                }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{coupon.code}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${coupon.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {coupon.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-gray-600 mb-3">{coupon.description}</p>
                  )}
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">
                        <strong>Descuento:</strong>{' '}
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value} MXN`}
                      </p>
                      <p className="text-gray-500">
                        <strong>Compra mínima:</strong> $
                        {coupon.min_purchase_amount.toLocaleString()} MXN
                      </p>
                      <p className="text-gray-500">
                        <strong>Usos:</strong> {coupon.current_uses} /{' '}
                        {coupon.max_uses || '∞'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">
                        <strong>Válido desde:</strong>{' '}
                        {new Date(coupon.valid_from).toLocaleDateString('es-MX')}
                      </p>
                      <p className="text-gray-500">
                        <strong>Válido hasta:</strong>{' '}
                        {coupon.valid_until
                          ? new Date(coupon.valid_until).toLocaleDateString('es-MX')
                          : 'Sin límite'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                    className={`px-3 py-1 text-sm rounded ${coupon.is_active
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                  >
                    {coupon.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleEdit(coupon)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
