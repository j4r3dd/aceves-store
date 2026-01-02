// app/api/banners/[id]/route.ts

import { NextRequest } from 'next/server';
import {
  getBannerById,
  updateBanner,
  deleteBanner,
  Banner
} from '../../../../lib/api/handlers/banners';
import {
  withErrorHandling,
  withValidation,
  withAdmin
} from '../../../../lib/api/middleware';
import {
  successResponse
} from '../../../../lib/api/utils';

// GET: Fetch a specific banner by ID
export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const banner = await getBannerById(id);
  return successResponse(banner);
});

// PATCH: Update a specific banner (admin only)
export const PATCH = withErrorHandling(
  withAdmin(
    withValidation<Partial<Banner>>({
      image_url: { type: 'string' },
      link: { type: 'string' },
      order: { type: 'number' },
    }, async (
      req,
      { params }: { params: Promise<{ id: string }> }
    ) => {
      const updates = req.validatedData;
      const { id } = await params;
      const result = await updateBanner(id, updates);
      return successResponse(result);
    })
  )
);


// DELETE: Delete a specific banner (admin only)
export const DELETE = withErrorHandling(
  withAdmin(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    await deleteBanner(id);
    return successResponse({ success: true });
  })
);