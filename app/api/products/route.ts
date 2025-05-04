// app/api/products/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { handleError, successResponse, ApiException } from '../../../lib/api/utils';
import { withErrorHandling } from '../../../lib/api/middleware';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  [key: string]: any;
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('products').select('*');

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return successResponse(data);
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  try {
    const body = await req.json() as Product;
    const supabase = createServerSupabaseClient();

    // Insert or update a product
    const { data, error } = await supabase
      .from('products')
      .upsert(body, { onConflict: 'id' })
      .select();

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return successResponse({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const supabase = createServerSupabaseClient();

    if (!id) {
      throw new ApiException(400, 'Product ID is required');
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleError(error);
  }
});