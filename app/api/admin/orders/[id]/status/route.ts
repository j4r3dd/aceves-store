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
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();

    const body = await req.json();
    const { status, trackingNumber, tracking_number } = body;

    // Support both camelCase and snake_case for backwards compatibility
    const finalTrackingNumber = trackingNumber || tracking_number;

    console.log('📦 Updating order status:', { status, trackingNumber: finalTrackingNumber });

    if (!status || !['paid', 'shipped', 'delivered'].includes(status)) {
      return successResponse(
        { error: 'Estado inválido. Debe ser: paid, shipped, o delivered' },
        400
      );
    }

    // Await params in Next.js 15
    const { id } = await params;
    const order = await updateOrderStatus(id, status, finalTrackingNumber);

    console.log('✅ Order updated successfully. Tracking number saved:', order.tracking_number);

    return successResponse(order);
  }
);
