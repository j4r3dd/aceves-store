'use client';

import { useEffect, useState } from 'react';

export default function ProductManagerPage() {
  const [jsonText, setJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageText: '',
  });

  const handleSaveProducts = async () => {
    try {
      // Validate JSON format
      const parsed = JSON.parse(jsonText);

      const res = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const result = await res.text();
      setJsonMessage(result);
    } catch (err) {
      console.error('Save error:', err);
      setJsonMessage(`❌ Error: ${err.message || 'Failed to save products'}`);
    }
  };

  const handleAddProduct = async () => {
    setAddMessage('');
    try {
      // Fetch the current products
      const res = await fetch('/data/products.json');
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      
      const currentProducts = await res.json();

      // Create the new product
      const id = `${newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
      const images = newProduct.imageText.split(',').map((url) => url.trim());

      const newEntry = {
        id,
        name: newProduct.name,
        category: newProduct.category,
        price: Number(newProduct.price),
        description: newProduct.description,
        images,
      };

      const updated = [...currentProducts, newEntry];

      // Save the updated product list
      const save = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!save.ok) {
        throw new Error(`Server responded with ${save.status}`);
      }

      setAddMessage(`✅ Product "${newEntry.name}" added!`);
      setNewProduct({ name: '', category: '', price: 0, description: '', imageText: '' });
      
      // Refresh the product list display
      fetchProducts();
    } catch (err) {
      console.error('Add product error:', err);
      setAddMessage(`❌ Error: ${err.message || 'Failed to add product'}`);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/data/products.json');
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`);
      }
      
      const data = await res.json();
      setJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error loading products.json', err);
      setError(`Failed to load products: ${err.message}`);
      setJsonText('[]'); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center">Loading products...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>
      
      {error && (
        <div className="w-full max-w-2xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

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
          <p className={`mt-4 text-sm ${jsonMessage.includes('❌') ? 'text-red-600' : 'text-green-600'} whitespace-pre-line`}>
            {jsonMessage}
          </p>
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
          <p className={`mt-4 text-sm ${addMessage.includes('❌') ? 'text-red-600' : 'text-green-600'} whitespace-pre-line`}>
            {addMessage}
          </p>
        )}
      </div>
    </div>
  );
}