// lib/api/handlers/products.ts - Updated to use the service

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  envio_cruzado?: boolean;
  [key: string]: any;
}

const service = SupabaseService.getInstance();
const TABLE_NAME = 'products';

export const getAllProducts = async (): Promise<Product[]> => {
  return service.getTable<Product>(TABLE_NAME);
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return service.getTable<Product>(TABLE_NAME, {
    filter: { category }
  });
};

export const getProductById = async (id: string): Promise<Product> => {
  return service.getRecord<Product>(TABLE_NAME, id);
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const id = generateProductId(product.name); // Create a function to generate a unique ID
  return service.createRecord<Product>(TABLE_NAME, { ...product, id });
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  return service.updateRecord<Product>(TABLE_NAME, id, product);
};

export const createOrUpdateProduct = async (product: Product): Promise<Product> => {
  return service.upsertRecord<Product>(TABLE_NAME, product);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  return service.deleteRecord(TABLE_NAME, id);
};

// Helper function to generate a URL-friendly ID based on the product name
function generateProductId(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;
}