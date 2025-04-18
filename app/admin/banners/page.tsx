'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ image_url: '', link: '', order: 0 });

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('order');
    setBanners(data || []);
  };

  const handleAddBanner = async () => {
    await supabase.from('banners').insert([newBanner]);
    setNewBanner({ image_url: '', link: '', order: 0 });
    fetchBanners();
  };

  const handleBannerChange = (index, field, value) => {
    const updated = [...banners];
    updated[index][field] = value;
    setBanners(updated);
  };

  const handleSaveChanges = async () => {
    const updates = await Promise.all(
      banners.map((b) =>
        supabase.from('banners').update({
          image_url: b.image_url,
          link: b.link,
          order: b.order,
        }).eq('id', b.id)
      )
    );
    alert('✅ Changes saved!');
    fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">📸 Manage Banners</h1>

      <input
        type="text"
        placeholder="Image URL"
        value={newBanner.image_url}
        onChange={(e) => setNewBanner({ ...newBanner, image_url: e.target.value })}
        className="border p-2 w-full bg-black"
      />
      <input
        type="text"
        placeholder="Link (e.g. /producto-1)"
        value={newBanner.link}
        onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
        className="border p-2 w-full bg-black"
      />
      <input
        type="number"
        placeholder="Order"
        value={newBanner.order}
        onChange={(e) => setNewBanner({ ...newBanner, order: Number(e.target.value) })}
        className="border p-2 w-full bg-black"
      />
      <button
        onClick={handleAddBanner}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        ➕ Add Banner
      </button>

      <hr className="border-gray-700 my-4" />

      <h2 className="text-lg font-semibold">📝 Existing Banners</h2>
      {banners.map((banner, index) => (
        <div key={banner.id} className="grid grid-cols-3 gap-4 items-center py-2">
          <input
            type="text"
            value={banner.image_url}
            onChange={(e) => handleBannerChange(index, 'image_url', e.target.value)}
            className="border p-2 bg-black"
          />
          <input
            type="text"
            value={banner.link}
            onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
            className="border p-2 bg-black"
          />
          <input
            type="number"
            value={banner.order}
            onChange={(e) => handleBannerChange(index, 'order', Number(e.target.value))}
            className="border p-2 bg-black"
          />
        </div>
      ))}

      <button
        onClick={handleSaveChanges}
        className="mt-4 px-6 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded"
      >
        💾 Save Changes
      </button>
    </div>
  );
}
