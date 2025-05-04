// lib/api/handlers/products.ts
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { ApiException } from '../../../lib/api/utils';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  [key: string]: any;
}

export const getAllProducts = async () => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('products').select('*');

  if (error) {
    throw new ApiException(500, error.message, error);
  }

  return data;
};

export const getProductById = async (id: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new ApiException(404, `Product with ID ${id} not found`);
    }
    throw new ApiException(500, error.message, error);
  }

  return data;
};

export const createOrUpdateProduct = async (product: Product) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('products')
    .upsert(product, { onConflict: 'id' })
    .select();

  if (error) {
    throw new ApiException(500, error.message, error);
  }

  return data;
};

export const deleteProduct = async (id: string) => {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new ApiException(500, error.message, error);
  }

  return true;
};