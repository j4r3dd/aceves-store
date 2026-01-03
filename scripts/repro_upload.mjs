
import fs from 'fs';
import path from 'path';

async function runRepro() {
    const url = 'http://localhost:3000/api/products/images'; // Adjust port if needed

    // Create a 5MB dummy file
    const size = 5 * 1024 * 1024;
    const buffer = Buffer.alloc(size, 'a');
    const tempFile = path.join(process.cwd(), 'temp_large_image.jpg');
    fs.writeFileSync(tempFile, buffer);

    const formData = new FormData();
    // We need a blob from the buffer to append to FormData in Node
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('file0', blob, 'large_image.jpg');
    formData.append('category', 'test');
    formData.append('productName', 'test-product');

    console.log(`Attempting to upload ${size / 1024 / 1024}MB file to ${url}...`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        console.log('Status:', res.status);
        console.log('StatusText:', res.statusText);
        const text = await res.text();
        console.log('Response body prefix:', text.substring(0, 100));

        if (res.status === 413 || text.includes('Too Large')) {
            console.log('SUCCESS: Reproduction confirmed (413 Payload Too Large)');
        } else {
            console.log('FAILED: Upload might have succeeded or failed with other error.');
        }
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        fs.unlinkSync(tempFile);
    }
}

runRepro();
