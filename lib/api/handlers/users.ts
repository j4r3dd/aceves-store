/**
 * User Registration and Profile Management Handlers
 */

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';
import { createServerSupabaseClient } from '../../supabase-server';
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
 */
export const registerUser = async (data: UserRegistrationData): Promise<{ user: any; profile: any }> => {
  const supabase = createServerSupabaseClient();

  // Check if user already exists by email
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', data.email)
    .single();

  if (existingProfile) {
    throw new ApiException(400, 'Ya existe una cuenta con este correo electrónico');
  }

  // Create auth user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nombre: data.nombre,
        phone: data.telefono,
      },
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
    email: data.email,
    nombre: data.nombre,
    phone: data.telefono,
    role: 'customer',
    total_orders: 0,
    total_spent: 0,
    customer_since: new Date().toISOString(),
    newsletter_subscribed: true,
  };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(profileData)
    .select()
    .single();

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Don't fail the registration if profile creation fails - it might be created by trigger
  }

  // Send welcome email (fire and forget - don't block on email sending)
  emailService.sendWelcomeEmail(data.email, data.nombre).catch((err) => {
    console.error('Failed to send welcome email:', err);
  });

  console.log('✅ User registered successfully:', authData.user.id);

  return {
    user: authData.user,
    profile: profile || profileData,
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
  const supabase = createServerSupabaseClient();

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
