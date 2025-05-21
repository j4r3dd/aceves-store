'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ProductManagerPage() {
  const [addMessage, setAddMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState('checking');
  
  // Updated product state with new "tallaYStock" field
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    imageText: '',
    tallaYStock: '', // New field for size and stock
  });

  // Check user session when component loads
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (!session) {
          console.warn("No active session found!");
          setSessionStatus('unauthenticated');
          setAddMessage("⚠️ You need to be logged in to add products.");
        } else {
          setSessionStatus('authenticated');
          console.log("Authenticated as:", session.user.email);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setSessionStatus('error');
      }
    };
    
    checkSession();
  }, []);

  // Function to parse size and stock information from string to JSON array
  const parseSizesAndStock = (sizeStockString) => {
    try {
      // Split by commas if multiple sizes exist
      const sizeEntries = sizeStockString.split(',').map(entry => entry.trim());
      
      // Transform each "Size:Stock" entry into a JSON object
      return sizeEntries.map(entry => {
        const [size, stockStr] = entry.split(':').map(part => part.trim());
        const stock = parseInt(stockStr, 10);
        
        if (!size || isNaN(stock)) {
          throw new Error('Invalid size or stock format');
        }
        
        return { size, stock };
      });
    } catch (error) {
      throw new Error('Please use the format "Size:Stock" (e.g., "Unitalla:10" or "S:5, M:10, L:3")');
    }
  };

  const handleAddProduct = async () => {
    setAddMessage('');
    setIsLoading(true);

    try {
      // Enhanced validation
      if (!newProduct.name.trim()) {
        throw new Error('Please enter a product name');
      }
      if (!newProduct.category.trim()) {
        throw new Error('Please enter a category');
      }
      if (!newProduct.price || newProduct.price <= 0) {
        throw new Error('Please enter a valid price');
      }
      if (!newProduct.imageText.trim()) {
        throw new Error('Please enter at least one image URL');
      }
      if (!newProduct.tallaYStock.trim()) {
        throw new Error('Please enter size and stock information');
      }

      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to add products');
      }
      
      console.log("Current user:", user.id);

      // Generate a more reliable ID
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const id = `${newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${timestamp}-${randomString}`;
      
      // Process images and validate URLs
      const images = newProduct.imageText
        .split(',')
        .map(url => url.trim())
        .filter(url => url); // Remove empty items
      
      if (images.length === 0) {
        throw new Error('Please enter at least one valid image URL');
      }

      // Parse the sizes and stock into the correct JSON format
      const sizes = parseSizesAndStock(newProduct.tallaYStock);

      // Create the product object with all fields including the properly formatted sizes
      const newEntry = {
        id,
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        price: Number(newProduct.price),
        description: newProduct.description.trim() || '', 
        images,
        sizes, // Now an array of objects with size and stock
      };

      console.log("Attempting to insert product:", newEntry);

      // Insert the product with error handling
      const { error: insertError } = await supabase
        .from('products')
        .insert(newEntry);
        
      if (insertError) {
        console.error("Supabase insert error:", insertError);
        
        // Handle specific database errors
        if (insertError.code === '23505') {
          throw new Error('A product with this ID already exists');
        } else if (insertError.code === '23503') {
          throw new Error('User authentication error');
        } else {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }

      console.log("Product added successfully!");
      setAddMessage(`✅ Product "${newEntry.name}" added to Supabase!`);
      
      // Reset form
      setNewProduct({
        name: '',
        category: '',
        price: 0,
        description: '',
        imageText: '',
        tallaYStock: '',
      });
      
    } catch (err) {
      console.error("Error adding product:", err);
      setAddMessage('❌ Failed to add product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>

      {sessionStatus === 'unauthenticated' && (
        <div className="w-full max-w-2xl p-4 mb-6 bg-yellow-100 text-yellow-800 rounded-md">
          You are not logged in. Please log in to manage products.
        </div>
      )}

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">➕ Add New Product</h2>
        <input
          type="text"
          placeholder="Product Name *"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Category (e.g. anillos, collares) *"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Price (e.g. 999) *"
          value={newProduct.price || ''}
          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          className="w-full mb-2 p-2 border rounded h-24"
        />
        {/* New field for Talla y Stock */}
        <textarea
          placeholder="Talla y Stock (e.g. Unitalla:10 or S:5, M:10, L:3) *"
          value={newProduct.tallaYStock}
          onChange={(e) => setNewProduct({ ...newProduct, tallaYStock: e.target.value })}
          className="w-full mb-2 p-2 border rounded h-20"
          required
        />
        <textarea
          placeholder="Image URLs (comma-separated) *"
          value={newProduct.imageText}
          onChange={(e) => setNewProduct({ ...newProduct, imageText: e.target.value })}
          className="w-full mb-4 p-2 border rounded h-20"
          required
        />
        <button
          onClick={handleAddProduct}
          disabled={isLoading || sessionStatus !== 'authenticated'}
          className={`w-full bg-black text-white py-2 px-6 rounded ${
            (isLoading || sessionStatus !== 'authenticated') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Product'}
        </button>
        
        {addMessage && (
          <div className={`mt-4 p-3 rounded text-sm ${
            addMessage.startsWith('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {addMessage}
          </div>
        )}
      </div>
    </div>
  );
}