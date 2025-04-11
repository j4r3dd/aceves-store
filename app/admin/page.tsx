// app/admin/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // Make sure path is correct

export default function AdminHome() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

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

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 mt-6"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}