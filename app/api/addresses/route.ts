/**
 * User Addresses API Route
 * GET /api/addresses - Get all addresses for current user
 * POST /api/addresses - Create a new address
 */

import { NextRequest } from 'next/server';
import { getUserAddresses, createUserAddress } from '../../../lib/api/handlers/addresses';
import { requireAuth } from '../../../lib/api/handlers/auth';
import { withErrorHandling, withValidation } from '../../../lib/api/middleware';
import { successResponse } from '../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const addresses = await getUserAddresses(user.id);
  return successResponse(addresses);
});

export const POST = withErrorHandling(
  withValidation(
    {
      nombre: { type: 'string', required: true },
      calle: { type: 'string', required: true },
      colonia: { type: 'string', required: true },
      ciudad: { type: 'string', required: true },
      cp: { type: 'string', required: true },
      pais: { type: 'string', required: true },
      telefono: { type: 'string', required: false },
      is_default: { type: 'boolean', required: false },
    },
    async (req: NextRequest) => {
      const user = await requireAuth();
      const addressData = { ...(req as any).validatedData, user_id: user.id };
      const address = await createUserAddress(addressData);
      return successResponse(address, 201);
    }
  )
);
