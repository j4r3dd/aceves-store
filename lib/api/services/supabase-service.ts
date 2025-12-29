// Let's create a unified API client service
// lib/api/services/supabase-service.ts

import { createServerSupabaseClient, createServiceRoleClient } from '../../supabase-server';
import { ApiException } from '../utils';

export class SupabaseService {
  private static instance: SupabaseService;

  private constructor() { }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public async getClient() {
    return await createServerSupabaseClient();
  }

  public getAdminClient() {
    return createServiceRoleClient();
  }

  public async getTable<T>(table: string, query?: any): Promise<T[]> {
    const supabase = await this.getClient();
    let queryBuilder = supabase.from(table).select('*');

    // Apply additional query parameters if provided
    if (query) {
      // Apply filters, ordering, etc.
      if (query.filter) {
        for (const [key, value] of Object.entries(query.filter)) {
          queryBuilder = queryBuilder.eq(key, value);
        }
      }

      if (query.order) {
        queryBuilder = queryBuilder.order(query.order.column, {
          ascending: query.order.ascending
        });
      }

      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return data as T[];
  }

  public async getRecord<T>(table: string, id: string): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiException(404, `Record with ID ${id} not found in ${table}`, error);
      }
      throw new ApiException(500, error.message, error);
    }

    return data as T;
  }

  public async createRecord<T>(table: string, record: any): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select();

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return data[0] as T;
  }

  public async updateRecord<T>(table: string, id: string, record: any): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(table)
      .update(record)
      .eq('id', id)
      .select();

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return data[0] as T;
  }

  public async upsertRecord<T>(table: string, record: any): Promise<T> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from(table)
      .upsert(record, { onConflict: 'id' })
      .select();

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return data[0] as T;
  }

  public async deleteRecord(table: string, id: string): Promise<boolean> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new ApiException(500, error.message, error);
    }

    return true;
  }
}