'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ImageUploadManager from '@/app/components/admin/ImageUploadManager';

// Category options
const CATEGORIES = [
  { value: 'anillos', label: 'Anillos de Promesa' },
  { value: 'collares', label: 'Collares' },
  { value: 'promociones', label: 'Promociones' },
];

// Predefined sizes by category
const RING_SIZES = ['5', '6', '7', '8', '9', '10'];
const DEFAULT_SIZES = ['Unitalla'];

export default function ProductManagerPage() {
  const [addMessage, setAddMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Updated product state with sizes as array
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: 0,
    description: '',
    images: [], // Array of strings (urls)
    sizes: [], // Array of { size: string, stock: number }
    envio_cruzado: false,
  });

  // Fetch all products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load products when component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper: Get suggested sizes based on category
  const getSuggestedSizes = (category) => {
    if (category === 'anillos') return RING_SIZES;
    return DEFAULT_SIZES;
  };

  // Helper: Add a size entry
  const addSizeEntry = (sizesArray, setSizesArray, sizeValue = '') => {
    setSizesArray([...sizesArray, { size: sizeValue, stock: 0 }]);
  };

  // Helper: Remove a size entry
  const removeSizeEntry = (sizesArray, setSizesArray, index) => {
    setSizesArray(sizesArray.filter((_, i) => i !== index));
  };

  // Helper: Update a size entry
  const updateSizeEntry = (sizesArray, setSizesArray, index, field, value) => {
    const updated = [...sizesArray];
    updated[index] = { ...updated[index], [field]: field === 'stock' ? Number(value) : value };
    setSizesArray(updated);
  };

  // Helper: Toggle a predefined size
  const togglePredefinedSize = (sizesArray, setSizesArray, sizeValue) => {
    const exists = sizesArray.find(s => s.size === sizeValue);
    if (exists) {
      setSizesArray(sizesArray.filter(s => s.size !== sizeValue));
    } else {
      setSizesArray([...sizesArray, { size: sizeValue, stock: 0 }]);
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
      if (!newProduct.category) {
        throw new Error('Please select a category');
      }
      if (!newProduct.price || newProduct.price <= 0) {
        throw new Error('Please enter a valid price');
      }
      if (newProduct.images.length === 0) {
        throw new Error('Please upload at least one image');
      }

      // Generate a more reliable ID
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const id = `${newProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${timestamp}-${randomString}`;

      // Create the product object with all fields
      const newEntry = {
        id,
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: Number(newProduct.price),
        description: newProduct.description.trim() || '',
        images: newProduct.images,
        sizes: newProduct.sizes.map(s => ({ size: s.size.trim(), stock: Number(s.stock) })),
        envio_cruzado: Boolean(newProduct.envio_cruzado),
      };

      console.log("Attempting to insert product:", newEntry);

      // Insert the product via API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      console.log("Product added successfully!");
      setAddMessage(`✅ Product "${newEntry.name}" added successfully!`);
      toast.success('Producto agregado exitosamente');
      fetchProducts();

      // Reset form
      setNewProduct({
        name: '',
        category: '',
        price: 0,
        description: '',
        images: [],
        sizes: [],
        envio_cruzado: false,
      });

    } catch (err) {
      console.error("Error adding product:", err);
      setAddMessage('❌ Failed to add product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      images: product.images || [],
      sizes: product.sizes || [],
    });
  };

  // Save edited product
  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      // Validate sizes
      if (editingProduct.sizes.length === 0) {
        throw new Error('Please add at least one size with stock');
      }
      const invalidSize = editingProduct.sizes.find(s => !s.size.trim());
      if (invalidSize) {
        throw new Error('All sizes must have a name');
      }

      const updates = {
        name: editingProduct.name.trim(),
        category: editingProduct.category,
        price: Number(editingProduct.price),
        description: editingProduct.description?.trim() || '',
        images: editingProduct.images,
        sizes: editingProduct.sizes.map(s => ({ size: s.size.trim(), stock: Number(s.stock) })),
        envio_cruzado: Boolean(editingProduct.envio_cruzado),
      };

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      setAddMessage(`✅ Product "${editingProduct.name}" updated successfully!`);
      toast.success('Producto actualizado exitosamente');
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error('Error updating product:', err);
      setAddMessage('❌ Failed to update product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      setAddMessage(`✅ Product deleted successfully!`);
      toast.success('Producto eliminado exitosamente');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setAddMessage('❌ Failed to delete product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🛍️ Manage Products</h1>

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

        {/* Category Dropdown */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
        <select
          value={newProduct.category}
          onChange={(e) => {
            const newCategory = e.target.value;
            setNewProduct({ ...newProduct, category: newCategory, sizes: [] });
          }}
          className="w-full mb-4 p-2 border rounded bg-white"
          required
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        {/* Envio Cruzado Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newProduct.envio_cruzado || false}
              onChange={(e) => setNewProduct({
                ...newProduct,
                envio_cruzado: e.target.checked
              })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Envío Cruzado (producto vendido como set de 2)
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6 mt-1">
            Permite enviar a 2 direcciones diferentes
          </p>
        </div>

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
          className="w-full mb-4 p-2 border rounded h-24"
        />

        {/* Size and Stock Section */}
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes and Stock *</label>

        {/* Suggested sizes based on category */}
        {newProduct.category && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Quick add sizes:</p>
            <div className="flex flex-wrap gap-2">
              {getSuggestedSizes(newProduct.category).map(size => {
                const isSelected = newProduct.sizes.some(s => s.size === size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => togglePredefinedSize(
                      newProduct.sizes,
                      (sizes) => setNewProduct({ ...newProduct, sizes }),
                      size
                    )}
                    className={`px-3 py-1 rounded-full text-sm border transition ${isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size entries list */}
        <div className="space-y-2 mb-3">
          {newProduct.sizes.map((sizeEntry, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Size (e.g. M, 7, Unitalla)"
                value={sizeEntry.size}
                onChange={(e) => updateSizeEntry(
                  newProduct.sizes,
                  (sizes) => setNewProduct({ ...newProduct, sizes }),
                  index,
                  'size',
                  e.target.value
                )}
                className="flex-1 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={sizeEntry.stock}
                onChange={(e) => updateSizeEntry(
                  newProduct.sizes,
                  (sizes) => setNewProduct({ ...newProduct, sizes }),
                  index,
                  'stock',
                  e.target.value
                )}
                className="w-24 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeSizeEntry(
                  newProduct.sizes,
                  (sizes) => setNewProduct({ ...newProduct, sizes }),
                  index
                )}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom size button */}
        <button
          type="button"
          onClick={() => addSizeEntry(
            newProduct.sizes,
            (sizes) => setNewProduct({ ...newProduct, sizes })
          )}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
        >
          <Plus className="w-4 h-4" /> Add custom size
        </button>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images *
          </label>
          <ImageUploadManager
            images={newProduct.images}
            onChange={(images) => setNewProduct({ ...newProduct, images })}
            category={newProduct.category || 'uncategorized'}
            productName={newProduct.name || `new-product-${Date.now()}`}
            maxImages={10}
          />
        </div>
        <button
          onClick={handleAddProduct}
          disabled={isLoading}
          className={`w-full bg-black text-white py-2 px-6 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
        >
          {isLoading ? 'Adding...' : 'Add Product'}
        </button>

        {addMessage && (
          <div className={`mt-4 p-3 rounded text-sm ${addMessage.startsWith('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
            {addMessage}
          </div>
        )}
      </div>

      {/* Product List Section */}
      <div className="w-full max-w-4xl mt-12">
        <h2 className="text-xl font-semibold mb-4">📦 Existing Products ({products.length})</h2>

        {loadingProducts ? (
          <div className="text-center py-8 text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No products found.</div>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 flex gap-4 items-start bg-gray-50">
                {/* Product Image */}
                <div className="w-20 h-20 relative flex-shrink-0 bg-white rounded overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                    {product.name}
                    {product.envio_cruzado && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        Envío Cruzado
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Category: <span className="font-medium">{product.category}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Price: <span className="font-medium">${product.price} MXN</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock: {product.sizes?.map((s, i) => (
                      <span key={i} className="inline-block bg-gray-200 rounded px-2 py-0.5 text-xs mr-1">
                        {s.size}: {s.stock}
                      </span>
                    ))}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product)}
                    className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            <input
              type="text"
              placeholder="Product Name *"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="w-full mb-2 p-2 border rounded"
            />

            {/* Category Dropdown */}
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              className="w-full mb-4 p-2 border rounded bg-white"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Envio Cruzado Checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProduct.envio_cruzado || false}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    envio_cruzado: e.target.checked
                  })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">
                  Envío Cruzado (producto vendido como set de 2)
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6 mt-1">
                Permite enviar a 2 direcciones diferentes
              </p>
            </div>

            <input
              type="number"
              placeholder="Price *"
              value={editingProduct.price || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={editingProduct.description || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="w-full mb-4 p-2 border rounded h-24"
            />

            {/* Size and Stock Section */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes and Stock *</label>

            {/* Suggested sizes based on category */}
            {editingProduct.category && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Quick add sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedSizes(editingProduct.category).map(size => {
                    const isSelected = editingProduct.sizes?.some(s => s.size === size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => togglePredefinedSize(
                          editingProduct.sizes || [],
                          (sizes) => setEditingProduct({ ...editingProduct, sizes }),
                          size
                        )}
                        className={`px-3 py-1 rounded-full text-sm border transition ${isSelected
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size entries list */}
            <div className="space-y-2 mb-3">
              {editingProduct.sizes?.map((sizeEntry, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Size"
                    value={sizeEntry.size}
                    onChange={(e) => updateSizeEntry(
                      editingProduct.sizes,
                      (sizes) => setEditingProduct({ ...editingProduct, sizes }),
                      index,
                      'size',
                      e.target.value
                    )}
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    min="0"
                    value={sizeEntry.stock}
                    onChange={(e) => updateSizeEntry(
                      editingProduct.sizes,
                      (sizes) => setEditingProduct({ ...editingProduct, sizes }),
                      index,
                      'stock',
                      e.target.value
                    )}
                    className="w-24 p-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeSizeEntry(
                      editingProduct.sizes,
                      (sizes) => setEditingProduct({ ...editingProduct, sizes }),
                      index
                    )}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add custom size button */}
            <button
              type="button"
              onClick={() => addSizeEntry(
                editingProduct.sizes || [],
                (sizes) => setEditingProduct({ ...editingProduct, sizes })
              )}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
            >
              <Plus className="w-4 h-4" /> Add custom size
            </button>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images *
              </label>
              <ImageUploadManager
                images={editingProduct.images}
                onChange={(images) => setEditingProduct({ ...editingProduct, images })}
                category={editingProduct.category}
                productName={editingProduct.name}
                existingSlug={editingProduct.slug}
                maxImages={10}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}