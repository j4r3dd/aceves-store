/**
 * Admin Coupons API Route
 * GET /api/admin/coupons - Get all coupons
 * POST /api/admin/coupons - Create a new coupon
 */

import { NextRequest } from 'next/server';
import { getAllCoupons, createCoupon } from '../../../../lib/api/handlers/coupons';
import { requireAdmin } from '../../../../lib/api/handlers/auth';
import { withErrorHandling, withValidation } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  const coupons = await getAllCoupons();
  return successResponse(coupons);
});

export const POST = withErrorHandling(
  withValidation(
    {
      id: { type: 'string', required: true },
      code: { type: 'string', required: true },
      discount_type: { type: 'string', required: true },
      discount_value: { type: 'number', required: true },
      min_purchase_amount: { type: 'number', required: false },
      max_uses: { type: 'number', required: false },
      valid_from: { type: 'string', required: false },
      valid_until: { type: 'string', required: false },
      is_active: { type: 'boolean', required: false },
      description: { type: 'string', required: false },
    },
    async (req: NextRequest) => {
      await requireAdmin();
      const couponData = (req as any).validatedData;
      const coupon = await createCoupon(couponData);
      return successResponse(coupon, 201);
    }
  )
);
