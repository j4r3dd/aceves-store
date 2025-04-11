import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return new Response('Invalid format: must be a JSON array.', { status: 400 });
    }

    // Make sure the directory exists
    const dir = path.join(process.cwd(), 'public', 'data');
    try {
      await fs.access(dir);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(dir, { recursive: true });
    }

    const filePath = path.join(dir, 'products.json');
    await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return new Response('✅ products.json updated successfully!');
  } catch (err) {
    console.error('❌ Error saving products:', err);
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}