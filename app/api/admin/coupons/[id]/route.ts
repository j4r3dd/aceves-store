/**
 * Admin Single Coupon API Route
 * PUT /api/admin/coupons/[id] - Update a coupon
 * DELETE /api/admin/coupons/[id] - Delete a coupon
 */

import { NextRequest } from 'next/server';
import { updateCoupon, deleteCoupon } from '../../../../../lib/api/handlers/coupons';
import { requireAdmin } from '../../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../../lib/api/middleware';
import { successResponse } from '../../../../../lib/api/utils';

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    const updates = await req.json();
    const coupon = await updateCoupon(params.id, updates);
    return successResponse(coupon);
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();
    await deleteCoupon(params.id);
    return successResponse({ success: true });
  }
);
