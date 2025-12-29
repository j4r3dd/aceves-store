'use client';

import { useState } from 'react';

export default function ImageUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('products/rings');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const data = await res.json();
    setUrl(data.url);
    setUploading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6">🖼️ Upload Product Images</h1>

      <input
        type="text"
        placeholder="Folder name (e.g. products/rings)"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
        className="border px-4 py-2 mb-4 rounded w-full max-w-md"
      />

      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md text-center cursor-pointer hover:bg-gray-50 transition">
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
        {uploading ? 'Uploading...' : 'Click or drag image here'}
      </label>

      {url && (
        <div className="mt-6">
          <p className="text-green-600">✅ Uploaded!</p>
          <input
            value={url}
            readOnly
            className="w-full mt-2 p-2 border rounded"
          />
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
}
