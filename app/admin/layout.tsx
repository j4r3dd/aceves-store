'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AdminLayout({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log(`Checking session on page: ${pathname}`);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsAuthorized(false);
          setLoading(false);
          return;
        }
        
        console.log('Session check result:', data.session ? 'Session found' : 'No session');
        
        if (data.session) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error checking session:', err);
        setLoading(false);
      }
    };
    
    checkSession();
  }, [pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
      } else {
        console.log('Login successful');
        setIsAuthorized(true);
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('An unexpected error occurred');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthorized(false);
      router.push('/admin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col w-full max-w-md">
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
      </div>
    );
  }

  // If authorized, render the children (admin pages) with admin header
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