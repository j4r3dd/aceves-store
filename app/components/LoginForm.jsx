/**
 * Customer Login Form Component
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSuccess, redirectTo = '/cuenta' }) {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Automatically redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, onSuccess, redirectTo, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(formData.email, formData.password);

      // Success!
      if (onSuccess) {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false); // Stop loading before pushing
        router.push(redirectTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError('Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.');
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
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition text-[#092536]"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#092536] focus:border-transparent transition text-[#092536]"
          placeholder="Tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#092536] text-white py-3 rounded-lg font-medium hover:bg-[#0a3a52] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <div className="text-center mt-4">
        <a
          href="/recuperar-contrasena"
          className="text-sm text-[#759bbb] hover:text-[#092536] hover:underline transition"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  );
}
