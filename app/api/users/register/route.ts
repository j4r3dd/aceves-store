/**
 * User Registration API Route
 * POST /api/users/register
 */

import { NextRequest } from 'next/server';
import { registerUser } from '../../../../lib/api/handlers/users';
import { withErrorHandling, withValidation } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const POST = withErrorHandling(
  withValidation(
    {
      email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      password: { type: 'string', required: true, min: 6 },
      nombre: { type: 'string', required: true },
      telefono: { type: 'string', required: false },
    },
    async (req: NextRequest) => {
      const data = (req as any).validatedData;

      const result = await registerUser(data);

      return successResponse(result, 201);
    }
  )
);
