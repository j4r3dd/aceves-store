'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  const defaultFolders = [
    'products/rings',
    'products/necklaces',
    'homepage/banners',
    'homepage/promos',
  ];

  const [baseFolder, setBaseFolder] = useState(defaultFolders[0]);
  const [subfolder, setSubfolder] = useState('');
  const [folders, setFolders] = useState(defaultFolders);

  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_UPLOAD_PASSWORD || 'aceves2024';

  const handleLogin = () => {
    if (password === correctPassword) {
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Construct full folder path: base/subfolder
    const fullPath = subfolder.trim()
      ? `${baseFolder}/${subfolder.trim().replace(/^\/+|\/+$/g, '')}`
      : baseFolder;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', fullPath);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setUrl(data.url);
    setUploading(false);
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
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Upload Product Image</h1>

      {/* Select base folder */}
      <select
        value={baseFolder}
        onChange={(e) => setBaseFolder(e.target.value)}
        className="border px-4 py-2 mb-3 rounded w-full max-w-md"
      >
        {folders.map((folder) => (
          <option key={folder} value={folder}>
            {folder}
          </option>
        ))}
      </select>

      {/* Optional subfolder */}
      <input
        type="text"
        placeholder="Optional subfolder (e.g. newring)"
        value={subfolder}
        onChange={(e) => setSubfolder(e.target.value)}
        className="border px-4 py-2 mb-4 rounded w-full max-w-md"
      />

      {/* File input */}
      <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full max-w-md text-center cursor-pointer hover:bg-gray-50 transition">
        <input type="file" accept="image/*" onChange={handleUpload} hidden />
        {uploading ? 'Uploading...' : 'Click or drag image here'}
      </label>

      {/* Uploaded preview */}
      {url && (
        <div className="mt-6 text-center">
          <p className="mb-2 text-green-600">Uploaded ✅</p>
          <input
            type="text"
            readOnly
            value={url}
            className="border px-3 py-2 w-full max-w-md rounded mb-2"
          />
          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  );
}
