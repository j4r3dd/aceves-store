'use client';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => handleNavigation('/admin/upload')}
          className="block text-center bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition"
        >
          Upload Images
        </button>

        <button
          onClick={() => handleNavigation('/admin/products')}
          className="block text-center bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition"
        >
          Manage Products
        </button>

        <button
          onClick={() => handleNavigation('/admin/banners')}
          className="block text-center bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition"
        >
          Manage Banners
        </button>

        <button
          onClick={() => handleNavigation('/admin/coupons')}
          className="block text-center bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition"
        >
          Manage Coupons
        </button>

        <button
          onClick={() => handleNavigation('/admin/orders')}
          className="block text-center bg-black text-white py-3 px-4 rounded hover:bg-gray-800 transition"
        >
          Manage Orders
        </button>
      </div>
    </div>
  );
}
