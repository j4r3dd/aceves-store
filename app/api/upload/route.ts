// app/api/upload/route.ts
// app/api/uploads/route.ts

import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  withAuth 
} from '../../../lib/api/middleware';
import { 
  successResponse, 
  ApiException 
} from '../../../lib/api/utils';
import { uploadFile } from '../../../lib/api/handlers/uploads';

// POST: Handle file uploads (requires authentication)
export const POST = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new ApiException(400, 'No file provided');
    }
    
    // Validate file type (optional)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new ApiException(400, 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF');
    }
    
    // Get folder from form data or default to 'uploads'
    const folder = formData.get('folder')?.toString() || 'uploads';
    
    // Upload the file
    const result = await uploadFile(file, folder);
    
    return successResponse(result, 201);
  })
);