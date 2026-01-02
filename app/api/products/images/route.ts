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
