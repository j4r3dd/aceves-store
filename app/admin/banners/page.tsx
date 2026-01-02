'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ImageUploadManager from '@/app/components/admin/ImageUploadManager';
import Image from 'next/image';
import { Upload } from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [selectedSection, setSelectedSection] = useState('main'); // 'main' | 'anillos' | 'collares'
  const [newBanner, setNewBanner] = useState({ image_url: '', link: '', order: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Sections configuration
  const sections = [
    { id: 'main', label: '🏠 Main Page' },
    { id: 'anillos', label: '💍 Anillos' },
    { id: 'collares', label: '📿 Collares' },
  ];

  const fetchBanners = async () => {
    try {
      const response = await fetch(`/api/banners?section=${selectedSection}`, {
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
      if (!newBanner.image_url) {
        throw new Error('Please upload an image');
      }

      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBanner, section: selectedSection }),
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
      toast.error(error instanceof Error ? error.message : 'Error al agregar banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickUpload = async (index, file) => {
    if (!file) return;

    // Upload the file first
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/app/api/banners/upload/route.ts'.replace('/app', '').replace('/route.ts', ''), { // Clean path just in case
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      // Fix: use the correct upload endpoint we created
      const realUploadRes = await fetch('/api/banners/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!realUploadRes.ok) throw new Error('Ready to upload failed');
      const data = await realUploadRes.json();

      handleBannerChange(index, 'image_url', data.image.url);
      toast.success('Image updated! correct');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload image');
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
  }, [selectedSection]);

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">📸 Manage Banners</h1>

      {/* Section Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setSelectedSection(section.id)}
            className={`px-4 py-2 rounded-t-lg transition-colors ${selectedSection === section.id
                ? 'bg-purple-700 text-white font-bold'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Banner Image</label>
        <ImageUploadManager
          images={newBanner.image_url ? [newBanner.image_url] : []}
          onChange={(images) => setNewBanner({ ...newBanner, image_url: images[0] || '' })}
          category="banners"
          productName={`banner-${Date.now()}`} // Unique folder mostly
          maxImages={1}
          apiEndpoint="/api/banners/upload"
        />
      </div>
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
        className={`px-4 py-2 bg-black text-white rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
      >
        {isLoading ? 'Agregando...' : '➕ Add Banner'}
      </button>

      <hr className="border-gray-700 my-4" />

      <h2 className="text-lg font-semibold">📝 Existing Banners</h2>

      {/* List Headers */}
      <div className="grid grid-cols-3 gap-4 mb-2 font-medium text-gray-400 text-sm">
        <div>Image Preview</div>
        <div>Target Link (e.g. /promotions)</div>
        <div>Display Order (1, 2, 3...)</div>
      </div>

      {banners.map((banner, index) => (
        <div key={banner.id} className="grid grid-cols-3 gap-4 items-center py-2">
          <div className="relative group">
            <div className="relative h-20 w-full bg-gray-900 rounded overflow-hidden">
              {banner.image_url ? (
                <Image src={banner.image_url} alt="Banner" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">No Image</div>
              )}
            </div>

            {/* Quick Replace Button */}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleQuickUpload(index, e.target.files[0])}
              />
              <Upload className="w-6 h-6 text-white" />
            </label>
          </div>
          <input
            type="text"
            value={banner.link}
            placeholder="Link URL"
            onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
            className="border p-2 bg-black w-full"
          />
          <input
            type="number"
            value={banner.order}
            placeholder="Order"
            onChange={(e) => handleBannerChange(index, 'order', Number(e.target.value))}
            className="border p-2 bg-black w-full"
          />
        </div>
      ))}

      <button
        onClick={handleSaveChanges}
        disabled={isLoading}
        className={`mt-4 px-6 py-2 bg-purple-700 text-white rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'
          }`}
      >
        {isLoading ? 'Guardando...' : '💾 Save Changes'}
      </button>
    </div>
  );
}
