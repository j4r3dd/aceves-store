// lib/api/handlers/uploads.ts

import { put, del } from '@vercel/blob';
import { ApiException, generateProductFolder } from '../utils';

export interface UploadResult {
  url: string;
  path: string;
}

export interface ProductImageUploadParams {
  file: File;
  category: string;
  productName: string;
  existingSlug?: string; // For editing existing products
}

export const uploadFile = async (
  file: File,
  folder: string = ''
): Promise<UploadResult> => {
  if (!file) {
    throw new ApiException(400, 'No file provided');
  }

  try {
    const filePath = folder ? `${folder}/${file.name}` : file.name;

    console.log(`📦 Uploading file to: ${filePath}`);

    const blob = await put(filePath, file.stream(), {
      access: 'public',
    });

    console.log('✅ File uploaded:', blob.url);

    return {
      url: blob.url,
      path: blob.pathname,
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw new ApiException(500, 'Failed to upload file', error);
  }
};

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

// Upload banner image
export const uploadBannerImage = async (file: File): Promise<UploadResult> => {
  // Add timestamp to prevent filename overwrites and organize in specific folder
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.name}`;
  const filePath = `banners/${filename}`;

  console.log(`📦 Uploading banner image to: ${filePath}`);

  const blob = await put(filePath, file.stream(), { access: 'public' });

  console.log('✅ Banner uploaded:', blob.url);

  return { url: blob.url, path: blob.pathname };
};
