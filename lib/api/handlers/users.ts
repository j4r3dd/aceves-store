/**
 * User Registration and Profile Management Handlers
 */

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';
import { createServerSupabaseClient, createServiceRoleClient } from '../../supabase-server';
import { emailService } from '../../email-service';

// Types
export interface UserRegistrationData {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  nombre?: string;
  phone?: string;
  role: string;
  total_orders: number;
  total_spent: number;
  customer_since: string;
  newsletter_subscribed?: boolean;
}

const service = SupabaseService.getInstance();

/**
 * Register a new customer user
 * With email confirmations enabled, users must verify their email before logging in
 */
export const registerUser = async (data: UserRegistrationData): Promise<{ user: any; requiresConfirmation: boolean }> => {
  // Use service role client to check for existing users
  const supabaseAdmin = createServiceRoleClient();

  // Check if user already exists by email (check auth.users via admin API)
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const userExists = existingUsers?.users?.some((u: any) => u.email === data.email);

  if (userExists) {
    throw new ApiException(400, 'Ya existe una cuenta con este correo electrónico');
  }

  // Use a regular client (not service role) for signUp so Supabase sends confirmation email
  const supabase = await createServerSupabaseClient();

  // Create auth user with Supabase Auth
  // Supabase will automatically send a confirmation email
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nombre: data.nombre,
        phone: data.telefono,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.acevesoficial.com'}/cuenta`,
    },
  });

  if (authError) {
    console.error('Auth error:', authError);
    throw new ApiException(400, authError.message);
  }

  if (!authData.user) {
    throw new ApiException(500, 'Error al crear el usuario');
  }

  // Create profile record (using service role to bypass RLS during creation)
  const profileData = {
    id: authData.user.id,
    nombre: data.nombre || '¿Cómo estás?',
    phone: data.telefono,
    role: 'customer',
    total_orders: 0,
    total_spent: 0,
    customer_since: new Date().toISOString(),
    newsletter_subscribed: true,
  };

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(profileData);

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Don't fail the registration if profile creation fails - it might be created by trigger
  }

  // DON'T send welcome email here - send it after email confirmation
  // The welcome email will be sent on first successful login

  console.log('✅ User registered successfully (confirmation required):', authData.user.id);

  return {
    user: authData.user,
    requiresConfirmation: true,
  };
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const profile = await service.getRecord<UserProfile>('profiles', userId);

  if (!profile) {
    throw new ApiException(404, 'Perfil de usuario no encontrado');
  }

  return profile;
};

/**
 * Update user profile
 * Users can only update certain fields (not role, stats, etc.)
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  // Filter out fields that users shouldn't be able to update directly
  const {
    role,
    email,
    total_orders,
    total_spent,
    customer_since,
    ...safeUpdates
  } = updates;

  if (Object.keys(safeUpdates).length === 0) {
    throw new ApiException(400, 'No hay campos válidos para actualizar');
  }

  const updatedProfile = await service.updateRecord<UserProfile>('profiles', userId, safeUpdates);

  if (!updatedProfile) {
    throw new ApiException(404, 'Perfil de usuario no encontrado');
  }

  console.log('✅ User profile updated:', userId);

  return updatedProfile;
};

/**
 * Get user's active discount (if any)
 */
export const getUserActiveDiscount = async (userId: string): Promise<{
  discount_type: string;
  discount_value: number;
  reason: string;
} | null> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_discounts')
    .select('discount_type, discount_value, reason')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('valid_from', new Date().toISOString())
    .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
    .order('discount_value', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (which is fine)
    console.error('Error fetching user discount:', error);
    return null;
  }

  return data;
};
