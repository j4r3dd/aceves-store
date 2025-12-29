// app/api/products/route.ts - Updated for consistency

import { NextRequest } from 'next/server';
import {
  getAllProducts,
  createOrUpdateProduct,
  deleteProduct,
  Product
} from '../../../lib/api/handlers/products';
import {
  withErrorHandling,
  withValidation,
  withAdmin
} from '../../../lib/api/middleware';
import {
  successResponse
} from '../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
  const products = await getAllProducts();
  return successResponse(products);
});

export const POST = withErrorHandling(
  withAdmin(
    withValidation<Product>({
      name: { type: 'string', required: true },
      category: { type: 'string', required: true },
      price: { type: 'number', required: true },
      description: { type: 'string', required: true },
      images: { type: 'array', required: true },
    }, async (req) => {
      const product = req.validatedData;
      const result = await createOrUpdateProduct(product);
      return successResponse(result);
    })
  )
);

export const DELETE = withErrorHandling(
  withAdmin(async (req: NextRequest) => {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      throw new Error('Product ID is required');
    }

    await deleteProduct(id);
    return successResponse({ success: true });
  })
);