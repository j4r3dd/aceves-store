/**
 * Coupon Validation API Route
 * POST /api/coupons/validate - Validate a coupon code
 */

import { NextRequest } from 'next/server';
import { validateCoupon } from '../../../../lib/api/handlers/coupons';
import { getCurrentUser } from '../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { code, cartTotal } = await req.json();

  if (!code || typeof cartTotal !== 'number') {
    return successResponse(
      { valid: false, discount: 0, message: 'Datos inválidos' },
      400
    );
  }

  // Get user if authenticated (optional for coupon validation)
  let userId: string | undefined;
  try {
    const user = await getCurrentUser();
    userId = user?.id;
  } catch {
    // User not authenticated - that's okay
  }

  const result = await validateCoupon(code, cartTotal, userId);
  return successResponse(result);
});
