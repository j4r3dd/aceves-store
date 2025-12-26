/**
 * Admin Orders API Route
 * GET /api/admin/orders - Get all orders (with optional filters)
 */

import { NextRequest } from 'next/server';
import { getAllOrders } from '../../../../lib/api/handlers/orders';
import { requireAdmin } from '../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  const orders = await getAllOrders({ status, limit });
  return successResponse(orders);
});
