'use client';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/admin/upload"
          className="block text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Upload Images
        </Link>
        <Link
          href="/admin/products"
          className="block text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Manage Products
        </Link>
      </div>
    </div>
  );
}
