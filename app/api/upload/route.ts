// app/api/upload/route.ts
import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { withErrorHandling } from '../../../lib/api/middleware';
import { handleError, successResponse, ApiException } from '../../../lib/api/utils';

export const POST = withErrorHandling(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder')?.toString() || '';

    if (!file) {
      throw new ApiException(400, 'No file uploaded');
    }

    // Add subfolder if provided
    const filePath = folder ? `${folder}/${file.name}` : file.name;

    console.log(`📦 Uploading file to: ${filePath}`);

    const blob = await put(filePath, file.stream(), {
      access: 'public',
    });

    console.log('✅ File uploaded:', blob.url);

    return successResponse({
      url: blob.url,
      path: blob.pathname,
    });
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return handleError(error);
  }
});