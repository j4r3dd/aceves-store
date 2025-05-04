// app/api/products/route.ts - Updated with shared handlers
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, withValidation } from '../../../../lib/api/middleware';
import { handleError, successResponse } from '../../../../lib/api/utils';
import { 
  getAllProducts, 
  createOrUpdateProduct, 
  deleteProduct,
  Product 
} from '../../../../lib/api/handlers/products';

export const GET = withErrorHandling(async () => {
  try {
    const products = await getAllProducts();
    return successResponse(products);
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withErrorHandling(
  withValidation<Product>({
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    price: { type: 'number', required: true },
    // Add other validations as needed
  }, async (req) => {
    try {
      const product = req.validatedData;
      const result = await createOrUpdateProduct(product);
      return successResponse({ success: true, data: result });
    } catch (error) {
      return handleError(error);
    }
  })
);

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await deleteProduct(id);
    return successResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
});