// app/api/banners/route.ts

import { NextRequest } from 'next/server';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  Banner
} from '../../../lib/api/handlers/banners';
import {
  withErrorHandling,
  withValidation,
  withAdmin
} from '../../../lib/api/middleware';
import {
  successResponse
} from '../../../lib/api/utils';

// GET: Fetch all banners (filtered by section)
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section') || 'main';
  const banners = await getAllBanners(section);
  return successResponse(banners);
});

// POST: Create a new banner (admin only)
export const POST = withErrorHandling(
  withAdmin(
    withValidation<Omit<Banner, 'id'>>({
      image_url: { type: 'string', required: true },
      link: { type: 'string', required: true },
      order: { type: 'number', required: true },
      section: { type: 'string', required: true }
    }, async (req) => {
      const banner = req.validatedData;
      const result = await createBanner(banner);
      return successResponse(result, 201);
    })
  )
);

// PATCH: Update existing banners (admin only)
export const PATCH = withErrorHandling(
  withAdmin(
    withValidation<{ id: string } & Partial<Banner>>({
      id: { type: 'string', required: true },
      image_url: { type: 'string' },
      link: { type: 'string' },
      order: { type: 'number' },
      section: { type: 'string' }
    }, async (req) => {
      const { id, ...updates } = req.validatedData;
      const result = await updateBanner(id, updates);
      return successResponse(result);
    })
  )
);

// DELETE: Delete a banner (admin only)
export const DELETE = withErrorHandling(
  withAdmin(async (req: NextRequest) => {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Banner ID is required');
    }

    await deleteBanner(id);
    return successResponse({ success: true });
  })
);