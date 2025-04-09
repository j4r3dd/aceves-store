'use client';

import { useEffect, useState } from 'react';

export default function ProductManagerPage() {
  const [jsonText, setJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState('');
  const [addMessage, setAddMessage] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageText: '',
  });

  const handleSaveProducts = async () => {
    try {
      const parsed = JSON.parse(jsonText);

      const res = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      const result = await res.text();
      setJsonMessage(result);
    } catch (err) {
      setJsonMessage('❌ Invalid JSON format or failed to save.');
      console.error('Save error:', err);
    }
  };

  const handleAddProduct = async () => {
    setAddMessage('');
    try {
      const res = await fetch('/data/products.json');
      const currentProducts = await res.json();

      const id = `${newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
      const images = newProduct.imageText.split(',').map((url) => url.trim());

      const newEntry = {
        id,
        name: newProduct.name,
        category: newProduct.category,
        price: newProduct.price,
        description: newProduct.description,
        images,
      };

      const updated = [...currentProducts, newEntry];

      const save = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!save.ok) throw new Error('Save failed');

      setAddMessage(`✅ Product "${newEntry.name}" added!`);
      setNewProduct({ name: '', category: '', price: 0, description: '', imageText: '' });
    } catch (err) {
      console.error(err);
      setAddMessage('❌ Failed to add product.');
    }
  };

  useEffect(() => {
    fetch('/data/products.json')
      .then((res) => res.json())
      .then((data) => setJsonText(JSON.stringify(data, null, 2)))
      .catch((err) => console.error('Error loading products.json', err));
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>

      {/* PRODUCTS.JSON Upload Panel */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">🧾 Edit Full Products JSON</h2>
        <textarea
          placeholder="Paste your products.json content here..."
          className="w-full h-60 p-3 border font-mono text-sm rounded"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <button
          onClick={handleSaveProducts}
          className="mt-4 bg-black text-white py-2 px-6 rounded hover:bg-gray-800"
        >
          Save Full File
        </button>
        {jsonMessage && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">{jsonMessage}</p>
        )}
      </div>

      {/* Divider */}
      <hr className="my-10 w-full max-w-2xl border-gray-300" />

      {/* Product Form */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">➕ Add New Product</h2>
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Category (e.g. anillos, collares)"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Price (e.g. 999)"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          className="w-full mb-2 p-2 border rounded h-24"
        />
        <textarea
          placeholder="Image URLs (comma-separated)"
          value={newProduct.imageText}
          onChange={(e) => setNewProduct({ ...newProduct, imageText: e.target.value })}
          className="w-full mb-4 p-2 border rounded h-20"
        />
        <button
          onClick={handleAddProduct}
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800"
        >
          Add Product
        </button>
        {addMessage && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">{addMessage}</p>
        )}
      </div>
    </div>
  );
}
