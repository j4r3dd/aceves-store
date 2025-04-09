// app/admin/layout.tsx
'use client';

import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_UPLOAD_PASSWORD || 'aceves2024';

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

  return <>{children}</>;
}
