import { put } from '@vercel/blob';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('🧪 Upload request received');

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder')?.toString() || '';

    if (!file) {
      console.log('❌ No file uploaded');
      return new Response('No file uploaded', { status: 400 });
    }

    // Add subfolder if provided
    const filePath = folder ? `${folder}/${file.name}` : file.name;

    console.log(`📦 Uploading file to: ${filePath}`);

    const blob = await put(filePath, file.stream(), {
      access: 'public',
    });

    console.log('✅ File uploaded:', blob.url);

    return Response.json({
      url: blob.url,
      path: blob.pathname,
    });
  } catch (err) {
    console.error('❌ Upload failed:', err);
    return new Response('Upload failed', { status: 500 });
  }
}
