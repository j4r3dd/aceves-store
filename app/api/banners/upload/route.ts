import { NextRequest } from 'next/server';
import { withErrorHandling, withAdmin } from '@/lib/api/middleware';
import { successResponse, ApiException } from '@/lib/api/utils';
import { uploadBannerImage } from '@/lib/api/handlers/uploads';

// POST: Upload banner image
export const POST = withErrorHandling(
    withAdmin(async (req: NextRequest) => {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            throw new ApiException(400, 'No file provided');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            throw new ApiException(400, 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
        }

        const result = await uploadBannerImage(file);

        return successResponse({ image: result }, 201);
    })
);
