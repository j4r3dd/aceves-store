# Unified Image Upload System - Implementation Plan

## Overview
Transform the product image management from a two-step process (upload → copy URL → paste) into a seamless integrated experience where admins upload images directly within the product form. Images will be automatically organized into folders by category and product name, displayed as thumbnails with delete buttons.

## User Requirements
- ✅ Upload images directly from PC in product form (no manual URL pasting)
- ✅ Auto-organize into folders: `category/product-slug/` (e.g., `anillos/promise-ring/`)
- ✅ Show image thumbnails with individual delete buttons
- ✅ New images append to existing (don't replace all)
- ✅ Keep `/admin/upload` page for banners/logos

## Architecture

### Current Flow
```
Admin → /admin/upload → Copy URL → /admin/products → Paste URL → Save
```

### New Flow
```
Admin → /admin/products → Upload files → Auto-organized → Thumbnails → Save
```

### Technology
- **Storage**: Vercel Blob (`@vercel/blob` package with `put()` and `del()`)
- **Database**: Supabase (stores image URLs in `products.images[]`)
- **Frontend**: Next.js App Router, React, TypeScript, Tailwind CSS

---

## Implementation Steps

### 1. Backend: Slug Utilities

**File**: `/lib/api/utils.ts`

Add slug generation functions for folder naming:

```typescript
export function generateSlug(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (á → a)
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Collapse multiple hyphens

  // Fallback for empty slugs (e.g., only special chars)
  return slug || `product-${Date.now()}`;
}

export function generateProductFolder(category: string, productName: string): string {
  const slug = generateSlug(productName);
  return `${category}/${slug}`;
}
```

**Why**: Convert product names like "Anillo de Corazón" → "anillo-de-corazon" for clean folder names.

---

### 2. Backend: Enhanced Upload Handler

**File**: `/lib/api/handlers/uploads.ts`

Add new functions for product-specific uploads and deletions:

```typescript
import { put, del } from '@vercel/blob'; // Add del import
import { generateProductFolder } from '../utils';

export interface ProductImageUploadParams {
  file: File;
  category: string;
  productName: string;
  existingSlug?: string; // For editing existing products
}

// Upload product image with auto-folder organization
export const uploadProductImage = async (
  params: ProductImageUploadParams
): Promise<UploadResult> => {
  const { file, category, productName, existingSlug } = params;

  // Use existing slug if editing, generate new if creating
  const folder = existingSlug
    ? `${category}/${existingSlug}`
    : generateProductFolder(category, productName);

  // Add timestamp to prevent filename overwrites
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filePath = `${folder}/${filename}`;

  console.log(`📦 Uploading product image to: ${filePath}`);

  const blob = await put(filePath, file.stream(), { access: 'public' });

  console.log('✅ File uploaded:', blob.url);

  return { url: blob.url, path: blob.pathname };
};

// Delete image from Vercel Blob
export const deleteFile = async (url: string): Promise<void> => {
  if (!url) {
    throw new ApiException(400, 'No URL provided for deletion');
  }

  try {
    console.log(`🗑️ Deleting file: ${url}`);
    await del(url);
    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw new ApiException(500, 'Failed to delete file', error);
  }
};

// Batch upload multiple files
export const uploadProductImages = async (
  files: File[],
  params: Omit<ProductImageUploadParams, 'file'>
): Promise<UploadResult[]> => {
  const uploads = files.map(file =>
    uploadProductImage({ ...params, file })
  );
  return Promise.all(uploads);
};
```

**Key Points**:
- Folder pattern: `category/product-slug/timestamp-filename.jpg`
- Timestamp prevents overwrites when uploading `image1.jpg` multiple times
- Existing products use their stored slug (folder stays consistent)

---

### 3. Backend: Product Image API Endpoint

**File**: `/app/api/products/images/route.ts` *(NEW FILE)*

Create dedicated endpoint for product image operations:

```typescript
import { NextRequest } from 'next/server';
import { withErrorHandling, withAdmin } from '@/lib/api/middleware';
import { successResponse, ApiException } from '@/lib/api/utils';
import { uploadProductImages, deleteFile } from '@/lib/api/handlers/uploads';

// POST: Upload product images
export const POST = withErrorHandling(
  withAdmin(async (req: NextRequest) => {
    const formData = await req.formData();

    // Extract multiple files
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      throw new ApiException(400, 'No files provided');
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFile = files.find(f => !allowedTypes.includes(f.type));
    if (invalidFile) {
      throw new ApiException(400, 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Get metadata
    const category = formData.get('category')?.toString();
    const productName = formData.get('productName')?.toString();
    const existingSlug = formData.get('existingSlug')?.toString();

    if (!category || !productName) {
      throw new ApiException(400, 'Category and product name required');
    }

    // Upload all files
    const results = await uploadProductImages(files, {
      category,
      productName,
      existingSlug
    });

    return successResponse({ images: results }, 201);
  })
);

// DELETE: Delete a product image
export const DELETE = withErrorHandling(
  withAdmin(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      throw new ApiException(400, 'Image URL required');
    }

    await deleteFile(url);
    return successResponse({ success: true });
  })
);
```

**Why separate endpoint**:
- Keeps upload logic isolated from product CRUD
- Allows image operations without full product updates
- Cleaner separation of concerns

---

### 4. Backend: Add Slug to Product Schema

**File**: `/lib/api/handlers/products.ts`

Update Product interface and creation logic:

```typescript
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  slug?: string; // NEW: For folder organization
  envio_cruzado?: boolean;
  [key: string]: any;
}

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const id = generateProductId(product.name);
  const slug = generateSlug(product.name); // NEW: Auto-generate slug
  return service.createRecord<Product>(TABLE_NAME, { ...product, id, slug });
};
```

**Migration**: Add to `/supabase/migrations/006_add_product_slug.sql` *(NEW FILE)*

```sql
-- Add slug column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Generate slugs for existing products
UPDATE products
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL;
```

---

### 5. Frontend: Image Upload Manager Component

**File**: `/app/components/admin/ImageUploadManager.tsx` *(NEW FILE)*

Create reusable component for image management:

```typescript
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface ImageUploadManagerProps {
  images: string[]; // Current image URLs
  onChange: (images: string[]) => void; // Callback when images change
  category: string;
  productName: string;
  existingSlug?: string;
  maxImages?: number;
}

export default function ImageUploadManager({
  images,
  onChange,
  category,
  productName,
  existingSlug,
  maxImages = 10
}: ImageUploadManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file, i) => formData.append(`file${i}`, file));
      formData.append('category', category);
      formData.append('productName', productName);
      if (existingSlug) formData.append('existingSlug', existingSlug);

      const response = await fetch('/api/products/images', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      const newUrls = data.images.map((img: any) => img.url);

      // Append new URLs to existing images
      onChange([...images, ...newUrls]);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number) => {
    const url = images[index];
    setDeletingIndex(index);

    try {
      const response = await fetch(
        `/api/products/images?url=${encodeURIComponent(url)}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Delete failed');

      onChange(images.filter((_, i) => i !== index));
      toast.success('Image deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer flex flex-col items-center gap-2 ${
            uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, WebP, GIF (max {maxImages} images)
              </span>
            </>
          )}
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, 150px"
              />

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(index)}
                disabled={deletingIndex === index}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded opacity-0 group-hover:opacity-100 transition hover:bg-red-700 disabled:opacity-50"
                type="button"
              >
                {deletingIndex === index ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

              {/* Image Index */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      <p className="text-sm text-gray-500">
        {images.length} / {maxImages} images
      </p>
    </div>
  );
}
```

**Features**:
- Multi-file upload with drag-and-drop
- Thumbnail previews (4-column grid)
- Individual delete buttons (visible on hover)
- Loading states for upload/delete
- Error handling with toast notifications
- Image limit enforcement

---

### 6. Frontend: Update Product Form

**File**: `/app/admin/products/page.tsx`

**Changes**:

1. **Import component** (add at top):
```typescript
import ImageUploadManager from '@/app/components/admin/ImageUploadManager';
```

2. **Update state** (line 28-36, remove `imageText`):
```typescript
const [newProduct, setNewProduct] = useState({
  name: '',
  category: '',
  price: 0,
  description: '',
  images: [], // CHANGED: Direct array instead of imageText string
  sizes: [],
  envio_cruzado: false,
});
```

3. **Replace textarea in form** (around line 440, search for `imageText`):

Remove:
```typescript
<textarea
  placeholder="Image URLs (comma-separated) *"
  value={newProduct.imageText}
  onChange={(e) => setNewProduct({ ...newProduct, imageText: e.target.value })}
  className="w-full mb-4 p-2 border rounded h-20"
  required
/>
```

Add:
```typescript
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Product Images *
  </label>
  <ImageUploadManager
    images={newProduct.images}
    onChange={(images) => setNewProduct({ ...newProduct, images })}
    category={newProduct.category}
    productName={newProduct.name || 'new-product'}
    maxImages={10}
  />
</div>
```

4. **Update validation** (in `handleAddProduct`, remove imageText parsing):

Remove:
```typescript
if (!newProduct.imageText.trim()) {
  throw new Error('Please enter at least one image URL');
}
const images = newProduct.imageText.split(',').map(url => url.trim()).filter(url => url);
```

Add:
```typescript
if (newProduct.images.length === 0) {
  throw new Error('Please upload at least one image');
}
```

5. **Update product creation** (use direct array):
```typescript
const newEntry = {
  id,
  name: newProduct.name.trim(),
  category: newProduct.category,
  price: Number(newProduct.price),
  description: newProduct.description.trim() || '',
  images: newProduct.images, // Direct array, no parsing
  sizes: newProduct.sizes.map(s => ({ size: s.size.trim(), stock: Number(s.stock) })),
  envio_cruzado: Boolean(newProduct.envio_cruzado),
};
```

6. **Update edit modal** (same changes):

Update `handleEdit`:
```typescript
const handleEdit = (product) => {
  setEditingProduct({
    ...product,
    images: product.images || [], // Direct array
    sizes: product.sizes || [],
  });
};
```

Replace textarea in edit modal with:
```typescript
<ImageUploadManager
  images={editingProduct.images}
  onChange={(images) => setEditingProduct({ ...editingProduct, images })}
  category={editingProduct.category}
  productName={editingProduct.name}
  existingSlug={editingProduct.slug}
  maxImages={10}
/>
```

---

## File Summary

### Files to Modify
1. **`/lib/api/utils.ts`** - Add `generateSlug()` and `generateProductFolder()`
2. **`/lib/api/handlers/uploads.ts`** - Add `uploadProductImage()`, `deleteFile()`, `uploadProductImages()`
3. **`/lib/api/handlers/products.ts`** - Add `slug` field to interface and creation
4. **`/app/admin/products/page.tsx`** - Replace `imageText` with `ImageUploadManager` component

### Files to Create
1. **`/app/api/products/images/route.ts`** - New API endpoint for image upload/delete
2. **`/app/components/admin/ImageUploadManager.tsx`** - Reusable upload component
3. **`/supabase/migrations/006_add_product_slug.sql`** - Database migration for slug column

### Files to Keep Unchanged
- **`/app/admin/upload/page.tsx`** - Standalone upload for banners/logos
- **`/app/api/upload/route.ts`** - Standalone upload endpoint

---

## Edge Cases & Solutions

### 1. Empty Product Name During Upload
**Issue**: User uploads images before entering product name

**Solution**: Disable upload until name is entered, or use placeholder:
```typescript
productName={newProduct.name || `new-product-${Date.now()}`}
```

### 2. Product Name Changes
**Issue**: User renames product after images uploaded

**Solution**: Keep existing slug/folder unchanged (don't break URLs)

### 3. Failed Uploads
**Issue**: Network error during upload

**Solution**: Show error toast, keep upload button enabled for retry

### 4. Delete Failures
**Issue**: Image deleted from Blob but database not updated

**Solution**: Optimistic UI update with rollback on failure:
```typescript
const originalImages = [...images];
try {
  await deleteFile(url);
  onChange(filtered);
} catch {
  onChange(originalImages); // Revert
}
```

### 5. Image Size Limits
**Issue**: User uploads large files (10MB+)

**Solution**: Add client-side validation:
```typescript
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (file.size > MAX_SIZE) {
  toast.error('Image too large. Max 5MB');
  return;
}
```

---

## Testing Checklist

- [ ] Create new product with multiple images
- [ ] Upload images one at a time
- [ ] Upload multiple images at once
- [ ] Delete individual images
- [ ] Edit existing product and add more images
- [ ] Verify folder structure: `category/product-slug/timestamp-filename.jpg`
- [ ] Test with special characters in product name (accents, symbols)
- [ ] Test max images limit (10)
- [ ] Test upload with network disconnected (error handling)
- [ ] Test delete with network disconnected (error handling)
- [ ] Verify standalone `/admin/upload` still works
- [ ] Test editing product without changing name (slug stays same)
- [ ] Test with invalid file types
- [ ] Verify existing products still display correctly

---

## Rollout Strategy

1. **Database Migration** - Add slug column to products table
2. **Backend First** - Deploy utils, handlers, and API endpoint
3. **Frontend Component** - Test ImageUploadManager in isolation
4. **Integration** - Update product form to use new component
5. **Testing** - Run through checklist with real data
6. **Deployment** - Deploy to production

**Estimated Time**: 4-6 hours total

---

## Success Criteria

✅ Admins can upload images directly in product form
✅ Images automatically organized in `category/product-name/` folders
✅ Thumbnails displayed with delete buttons
✅ New images append to existing (not replace)
✅ Standalone `/admin/upload` page still functional
✅ No manual URL copying required
✅ Existing products remain unaffected
