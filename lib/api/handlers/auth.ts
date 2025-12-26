// lib/api/handlers/auth.ts

import { createServerSupabaseClient } from '../../supabase-server';
import { ApiException } from '../utils';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new ApiException(401, 'User not authenticated', error);
  }

  return data.user as AuthUser;
};

export const requireAuth = async (): Promise<AuthUser> => {
  const user = await getCurrentUser();

  if (!user) {
    throw new ApiException(401, 'Authentication required');
  }

  return user;
};

export const requireAdmin = async (): Promise<AuthUser> => {
  const user = await requireAuth();

  // Check if user has admin role
  // This is just an example - adapt to your Supabase structure
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data || data.role !== 'admin') {
    throw new ApiException(403, 'Admin access required');
  }

  return user;
};