/**
 * Login/Register Page with Tabbed Interface
 */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/cuenta';
  const confirmed = searchParams.get('confirmed') === 'true';

  // Default to 'login' tab, but allow 'register' via URL param
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="min-h-screen bg-[#092536] flex items-center justify-center py-12 px-6">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 font-serif">
          Bienvenido a Aceves Joyería
        </h1>

        {/* Email Confirmation Success Message */}
        {confirmed && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <p className="font-semibold mb-1">✓ ¡Correo confirmado exitosamente!</p>
            <p className="text-sm">Tu cuenta ha sido verificada. Ahora puedes iniciar sesión.</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'login'
              ? 'border-b-2 border-[#092536] text-[#092536]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'register'
              ? 'border-b-2 border-[#092536] text-[#092536]'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'login' ? (
            <LoginForm redirectTo={redirectTo} />
          ) : (
            <RegistrationForm redirectTo={redirectTo} />
          )}
        </div>

        {/* Switch Tab Links */}
        <div className="mt-8 text-center text-sm text-gray-600">
          {activeTab === 'login' ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-[#092536] hover:underline font-medium"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-[#092536] hover:underline font-medium"
              >
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
