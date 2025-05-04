// app/api/upload/route.ts

import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../lib/api/middleware';
import { successResponse } from '../../../lib/api/utils';
import { uploadFile } from '../../../lib/api/handlers/uploads';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder')?.toString() || '';

  const result = await uploadFile(file, folder);
  return successResponse(result);
});