'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  // Check cookie via API route or just wait for login
  useEffect(() => {
    fetch('/api/check-auth')
      .then((res) => res.ok && setIsAuthorized(true))
      .catch(() => {});
  }, []);

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      setIsAuthorized(true);
      router.refresh(); // optional
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
