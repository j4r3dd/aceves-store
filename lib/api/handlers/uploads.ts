// lib/api/handlers/uploads.ts

import { put } from '@vercel/blob';
import { ApiException } from '../utils';

export interface UploadResult {
  url: string;
  path: string;
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