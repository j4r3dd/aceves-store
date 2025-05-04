// lib/api/handlers/banners.ts

import { SupabaseService } from '../services/supabase-service';

export interface Banner {
  id?: string;
  image_url: string;
  link: string;
  order: number;
}

const service = SupabaseService.getInstance();
const TABLE_NAME = 'banners';

export const getAllBanners = async (): Promise<Banner[]> => {
  return service.getTable<Banner>(TABLE_NAME, {
    order: { column: 'order', ascending: true }
  });
};

export const getBannerById = async (id: string): Promise<Banner> => {
  return service.getRecord<Banner>(TABLE_NAME, id);
};

export const createBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner> => {
  return service.createRecord<Banner>(TABLE_NAME, banner);
};

export const updateBanner = async (id: string, banner: Partial<Banner>): Promise<Banner> => {
  return service.updateRecord<Banner>(TABLE_NAME, id, banner);
};

export const deleteBanner = async (id: string): Promise<boolean> => {
  return service.deleteRecord(TABLE_NAME, id);
};