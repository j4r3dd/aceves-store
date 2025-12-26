/**
 * Address Management Page
 * Allows users to manage their shipping addresses
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

export default function AddressManagementPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    calle: '',
    colonia: '',
    ciudad: '',
    cp: '',
    pais: 'México',
    telefono: '',
    is_default: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cuenta/direcciones');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, router]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/addresses');

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Error al cargar las direcciones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/addresses/${editingId}` : '/api/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingId ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente'
        );
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar la dirección');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Error al guardar la dirección');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      nombre: address.nombre,
      calle: address.calle,
      colonia: address.colonia,
      ciudad: address.ciudad,
      cp: address.cp,
      pais: address.pais || 'México',
      telefono: address.telefono || '',
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Dirección eliminada correctamente');
        fetchAddresses();
      } else {
        toast.error('Error al eliminar la dirección');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error al eliminar la dirección');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      calle: '',
      colonia: '',
      ciudad: '',
      cp: '',
      pais: 'México',
      telefono: '',
      is_default: false,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-center text-gray-500">Cargando direcciones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cuenta"
          className="text-[#092536] hover:underline text-sm font-medium mb-2 inline-block"
        >
          ← Volver a Mi Cuenta
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Mis Direcciones</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#092536] text-white rounded-lg hover:bg-[#0a3a52] transition-colors font-medium"
            >
              + Nueva Dirección
            </button>
          )}
        </div>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? 'Editar Dirección' : 'Nueva Dirección'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Calle y Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="calle"
                value={formData.calle}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Colonia <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cp"
                  value={formData.cp}
                  onChange={handleChange}
                  required
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  País <span className="text-red-500">*</span>
                </label>
                <select
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#092536]"
                >
                  <option value="México">México</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_default"
                id="is_default"
                checked={formData.is_default}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="is_default" className="text-sm text-gray-700">
                Establecer como dirección predeterminada
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-[#092536] text-white rounded-lg hover:bg-[#0a3a52] transition-colors font-medium"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
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

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No tienes direcciones guardadas.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-[#092536] text-white rounded-lg hover:bg-[#0a3a52] transition-colors"
              >
                Agregar primera dirección
              </button>
            )}
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                address.is_default ? 'ring-2 ring-[#092536]' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {address.is_default && (
                    <span className="inline-block bg-[#092536] text-white text-xs px-2 py-1 rounded mb-2">
                      Dirección predeterminada
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-800 text-lg">{address.nombre}</h3>
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p>{address.calle}</p>
                    <p>{address.colonia}</p>
                    <p>
                      {address.ciudad}, CP {address.cp}
                    </p>
                    <p>{address.pais}</p>
                    {address.telefono && <p className="pt-1">{address.telefono}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
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
