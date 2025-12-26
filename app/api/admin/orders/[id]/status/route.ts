/**
 * Admin Order Status Update API Route
 * PUT /api/admin/orders/[id]/status - Update order status and send shipping notification
 */

import { NextRequest } from 'next/server';
import { updateOrderStatus } from '../../../../../../lib/api/handlers/orders';
import { requireAdmin } from '../../../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../../../lib/api/middleware';
import { successResponse } from '../../../../../../lib/api/utils';

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAdmin();

    const { status, trackingNumber } = await req.json();

    if (!status || !['paid', 'shipped', 'delivered'].includes(status)) {
      return successResponse(
        { error: 'Estado inválido. Debe ser: paid, shipped, o delivered' },
        400
      );
    }

    const order = await updateOrderStatus(params.id, status, trackingNumber);
    return successResponse(order);
  }
);
