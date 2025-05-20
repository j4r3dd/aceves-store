// app/admin/layout.tsx (Refactored)
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

// Login form component
function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, error: authError } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col w-full max-w-md">
      {(error || authError) && <p className="text-red-500 mb-4">{error || authError}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border px-4 py-2 rounded mb-3"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border px-4 py-2 rounded mb-3"
        required
      />
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Enter
      </button>
    </form>
  );
}

export default function AdminLayout({ children }) {
  const { isAuthenticated, loading, user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if not loading and not authenticated
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, showing login form');
      // Don't redirect - the layout will show the login form
    }
  }, [isAuthenticated, loading]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/admin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <AdminLoginForm />
      </div>
    );
  }

  // If authenticated, render the admin layout with children
  return (
    <div>
      {/* Admin header with logout button */}
      <div className="bg-gray-800 text-white p-3">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="/admin" className="font-semibold hover:text-gray-300">Admin Dashboard</a>
            <a href="/admin/upload" className="text-sm hover:text-gray-300">Upload</a>
            <a href="/admin/products" className="text-sm hover:text-gray-300">Products</a>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-4">
        {children}
      </div>
    </div>
  );
}