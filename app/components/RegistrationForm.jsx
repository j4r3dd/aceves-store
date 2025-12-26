/**
 * Customer Registration Form Component
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function RegistrationForm({ onSuccess, redirectTo = '/cuenta' }) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        telefono: formData.telefono,
      });

      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1 text-gray-700">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium mb-1 text-gray-700">
          Teléfono (opcional)
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
          placeholder="3312345678"
        />
        <p className="text-xs text-gray-500 mt-1">10 dígitos, sin espacios</p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
          Contraseña <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-gray-700">
          Confirmar contraseña <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition"
          placeholder="Repite tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#092536] text-white py-3 rounded-lg font-medium hover:bg-[#0a3a52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Al crear una cuenta, aceptas nuestros términos y condiciones
      </p>
    </form>
  );
}
