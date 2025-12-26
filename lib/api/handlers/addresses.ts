/**
 * User Address Management Handlers
 */

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';
import { createServerSupabaseClient } from '../../supabase-server';

// Types
export interface UserAddress {
  id?: string;
  user_id: string;
  nombre: string;
  calle: string;
  colonia: string;
  ciudad: string;
  cp: string;
  pais: string;
  telefono?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

const service = SupabaseService.getInstance();

/**
 * Get all addresses for a user
 */
export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  const addresses = await service.getTable<UserAddress>('user_addresses', {
    filter: { user_id: userId },
    order: { column: 'is_default', ascending: false },
  });

  return addresses;
};

/**
 * Create a new address for a user
 */
export const createUserAddress = async (
  address: Omit<UserAddress, 'id' | 'created_at' | 'updated_at'>
): Promise<UserAddress> => {
  const supabase = await createServerSupabaseClient();

  // If this address is being set as default, unset other defaults first
  if (address.is_default) {
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', address.user_id);
  }

  const newAddress = await service.createRecord<UserAddress>('user_addresses', address);

  if (!newAddress) {
    throw new ApiException(500, 'Error al crear la dirección');
  }

  console.log('✅ Address created:', newAddress.id);

  return newAddress;
};

/**
 * Update an existing address
 */
export const updateUserAddress = async (
  addressId: string,
  updates: Partial<UserAddress>
): Promise<UserAddress> => {
  const supabase = await createServerSupabaseClient();

  // If setting this address as default, unset other defaults
  if (updates.is_default) {
    // First get the address to find the user_id
    const { data: address } = await supabase
      .from('user_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (address) {
      // Unset all other defaults for this user
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id)
        .neq('id', addressId);
    }
  }

  const updatedAddress = await service.updateRecord<UserAddress>('user_addresses', addressId, updates);

  if (!updatedAddress) {
    throw new ApiException(404, 'Dirección no encontrada');
  }

  console.log('✅ Address updated:', addressId);

  return updatedAddress;
};

/**
 * Delete an address
 */
export const deleteUserAddress = async (addressId: string): Promise<boolean> => {
  const success = await service.deleteRecord('user_addresses', addressId);

  if (!success) {
    throw new ApiException(404, 'Dirección no encontrada');
  }

  console.log('✅ Address deleted:', addressId);

  return true;
};

/**
 * Get user's default address
 */
export const getDefaultAddress = async (userId: string): Promise<UserAddress | null> => {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching default address:', error);
    throw new ApiException(500, error.message);
  }

  return data;
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (addressId: string, userId: string): Promise<UserAddress> => {
  const supabase = await createServerSupabaseClient();

  // Unset all other defaults
  await supabase
    .from('user_addresses')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Set this one as default
  const updatedAddress = await service.updateRecord<UserAddress>('user_addresses', addressId, {
    is_default: true,
  });

  if (!updatedAddress) {
    throw new ApiException(404, 'Dirección no encontrada');
  }

  console.log('✅ Default address set:', addressId);

  return updatedAddress;
};
