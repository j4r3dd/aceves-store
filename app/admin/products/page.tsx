'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ProductManagerPage() {
  const [jsonText, setJsonText] = useState('');
  const [jsonMessage, setJsonMessage] = useState('');
  const [addMessage, setAddMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageText: '',
  });

  // Save to both Supabase and JSON file
  const handleSaveProducts = async () => {
    try {
      setIsLoading(true);
      const parsed = JSON.parse(jsonText);

      // Save to local JSON file first
      const res = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      // Then synchronize with Supabase
      // First delete all existing products
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .neq('id', '0'); // Delete all records
      
      if (deleteError) throw deleteError;

      // Then insert all products from the JSON
      const { error: insertError } = await supabase
        .from('products')
        .insert(parsed);

      if (insertError) throw insertError;

      const result = await res.text();
      setJsonMessage(result + ' (Synced with Supabase)');
    } catch (err) {
      console.error('Save error:', err);
      setJsonMessage('❌ Error: ' + (err.message || 'Failed to save products'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    setAddMessage('');
    setIsLoading(true);
    
    try {
      // Get current products from JSON file
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

      // Save to JSON file
      const save = await fetch('/api/admin/save-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!save.ok) throw new Error('Save to JSON failed');

      // Add to Supabase
      const { error: supabaseError } = await supabase
        .from('products')
        .insert(newEntry);

      if (supabaseError) throw supabaseError;

      setAddMessage(`✅ Product "${newEntry.name}" added to JSON and Supabase!`);
      setNewProduct({ name: '', category: '', price: 0, description: '', imageText: '' });
      
      // Refresh the products display
      fetch('/data/products.json')
        .then((res) => res.json())
        .then((data) => setJsonText(JSON.stringify(data, null, 2)))
        .catch((err) => console.error('Error loading products.json', err));
      
    } catch (err) {
      console.error(err);
      setAddMessage('❌ Failed to add product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // First try to load from Supabase
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // If Supabase has data, use it and update the JSON file
          setJsonText(JSON.stringify(data, null, 2));
          
          // Sync to JSON file for consistency
          fetch('/api/admin/save-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }).catch(err => {
            console.error('Error syncing to JSON file:', err);
          });
          
          return;
        }
      } catch (supabaseErr) {
        console.error('Error loading from Supabase:', supabaseErr);
      }
      
      // Fallback to local JSON if Supabase fails or is empty
      fetch('/data/products.json')
        .then((res) => res.json())
        .then((data) => setJsonText(JSON.stringify(data, null, 2)))
        .catch((err) => console.error('Error loading products.json', err));
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>

      {/* PRODUCTS.JSON Upload Panel */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">🧾 Edit Full Products JSON & Supabase</h2>
        <textarea
          placeholder="Paste your products.json content here..."
          className="w-full h-60 p-3 border font-mono text-sm rounded"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <button
          onClick={handleSaveProducts}
          disabled={isLoading}
          className={`mt-4 bg-black text-white py-2 px-6 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
        >
          {isLoading ? 'Saving...' : 'Save to File & Supabase'}
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