/**
 * Orders API Route
 * GET /api/orders - Get all orders for current user
 */

import { getUserOrders } from '../../../lib/api/handlers/orders';
import { requireAuth } from '../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../lib/api/middleware';
import { successResponse } from '../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const orders = await getUserOrders(user.id);
  return successResponse(orders);
});
