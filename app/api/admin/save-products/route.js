import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return new Response('Invalid format: must be a JSON array.', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return new Response('✅ products.json updated successfully!');
  } catch (err) {
    console.error('❌ Error saving products:', err);
    return new Response('Server error', { status: 500 });
  }
}
