'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminHome() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword = process.env.ADMIN_UPLOAD_PASSWORD;

  const handleLogin = () => {
    if (password === correctPassword) {
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-black">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-4 py-2 rounded mb-3"
        />
        <button
          onClick={handleLogin}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white text-black text-center">
      <h1 className="text-4xl font-bold mb-6">🛠️ Admin Dashboard</h1>
      <p className="text-lg mb-8">Welcome! Choose where to go:</p>

      <div className="flex flex-col items-center gap-4">
        <Link href="/admin/products">
          <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
            🛒 Manage Products
          </button>
        </Link>

        <Link href="/admin/upload">
          <button className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800">
            📤 Upload Images
          </button>
        </Link>
      </div>
    </div>
  );
}
