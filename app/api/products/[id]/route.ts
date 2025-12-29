// app/api/products/[id]/route.ts - Updated for consistency

import { NextRequest } from 'next/server';
import {
  getProductById,
  updateProduct,
  deleteProduct,
  Product
} from '../../../../lib/api/handlers/products';
import {
  withErrorHandling,
  withValidation,
  withAdmin
} from '../../../../lib/api/middleware';
import {
  successResponse
} from '../../../../lib/api/utils';

export const GET = withErrorHandling(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const product = await getProductById(params.id);
  return successResponse(product);
});

export const PATCH = withErrorHandling(
  withAdmin(
    withValidation<Partial<Product>>({
      name: { type: 'string' },
      category: { type: 'string' },
      price: { type: 'number' },
      description: { type: 'string' },
      images: { type: 'array' },
    }, async (
      req,
      { params }: { params: { id: string } }
    ) => {
      const updates = req.validatedData;
      const result = await updateProduct(params.id, updates);
      return successResponse(result);
    })
  )
);

export const DELETE = withErrorHandling(
  withAdmin(async (
    req: NextRequest,
    { params }: { params: { id: string } }
  ) => {
    await deleteProduct(params.id);
    return successResponse({ success: true });
  })
);