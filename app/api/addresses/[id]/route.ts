/**
 * Single Address API Route
 * PUT /api/addresses/[id] - Update an address
 * DELETE /api/addresses/[id] - Delete an address
 */

import { NextRequest } from 'next/server';
import { updateUserAddress, deleteUserAddress } from '../../../../lib/api/handlers/addresses';
import { requireAuth } from '../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAuth();
    const updates = await req.json();
    const address = await updateUserAddress(params.id, updates);
    return successResponse(address);
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    await requireAuth();
    await deleteUserAddress(params.id);
    return successResponse({ success: true });
  }
);
