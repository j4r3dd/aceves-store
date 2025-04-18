'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ProductManagerPage() {
  const [products, setProducts] = useState([]);
  const [addMessage, setAddMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageText: '',
  });

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleAddProduct = async () => {
    setAddMessage('');
    setIsLoading(true);

    try {
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

      const { error } = await supabase.from('products').insert(newEntry);
      if (error) throw error;

      setAddMessage(`✅ Product "${newEntry.name}" added to Supabase!`);
      setNewProduct({ name: '', category: '', price: 0, description: '', imageText: '' });
      fetchProducts(); // Refresh the list
    } catch (err) {
      console.error(err);
      setAddMessage('❌ Failed to add product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>

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
          disabled={isLoading}
          className={`bg-black text-white py-2 px-6 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
        >
          {isLoading ? 'Adding...' : 'Add Product'}
        </button>
        {addMessage && (
          <p className="mt-4 text-sm text-gray-600 whitespace-pre-line">{addMessage}</p>
        )}
      </div>
    </div>
  );
}
