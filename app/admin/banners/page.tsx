'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({ image_url: '', link: '', order: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await response.json();
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Error al cargar banners');
    }
  };

  const handleAddBanner = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add banner');
      }

      toast.success('Banner agregado exitosamente');
      setNewBanner({ image_url: '', link: '', order: 0 });
      fetchBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('Error al agregar banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerChange = (index, field, value) => {
    const updated = [...banners];
    updated[index][field] = value;
    setBanners(updated);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await Promise.all(
        banners.map(async (b) => {
          const response = await fetch(`/api/banners/${b.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: b.image_url,
              link: b.link,
              order: b.order,
            }),
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error(`Failed to update banner ${b.id}`);
          }
        })
      );
      toast.success('Cambios guardados exitosamente');
      fetchBanners();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error al guardar cambios');
    } finally {
      setIsLoading(false);
    }
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
        disabled={isLoading}
        className={`px-4 py-2 bg-black text-white rounded ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
        }`}
      >
        {isLoading ? 'Agregando...' : '➕ Add Banner'}
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
        disabled={isLoading}
        className={`mt-4 px-6 py-2 bg-purple-700 text-white rounded ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'
        }`}
      >
        {isLoading ? 'Guardando...' : '💾 Save Changes'}
      </button>
    </div>
  );
}
