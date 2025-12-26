
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const { user, profile, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        phone: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/cuenta/perfil');
            return;
        }

        if (profile) {
            setFormData({
                nombre: profile.nombre || '',
                phone: profile.phone || '', // backend uses 'phone', page uses 'phone' to display.
            });
        }
    }, [isAuthenticated, profile, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            const updatedProfile = await res.json();
            // Force reload or redirect to update context
            router.push('/cuenta');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error al guardar los cambios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto px-6 py-12">
            <div className="mb-8">
                <Link href="/cuenta" className="text-gray-500 hover:text-gray-800 text-sm">
                    &larr; Volver a Mi Cuenta
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mt-4">Editar Perfil</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#092536] focus:border-transparent outline-none"
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#092536] focus:border-transparent outline-none"
                            placeholder="Tu número de teléfono"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#092536] text-white py-3 rounded-lg hover:bg-[#0a3a52] transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
