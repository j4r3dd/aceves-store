/**
 * Coupon Validation and Management Handlers
 */

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';
import { createServerSupabaseClient } from '../../supabase-server';

// Types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  message?: string;
  coupon?: Coupon;
}

const service = SupabaseService.getInstance();

/**
 * Validate a coupon code
 * Checks all conditions: active, date validity, usage limits, minimum purchase
 */
export const validateCoupon = async (
  code: string,
  cartTotal: number,
  userId?: string
): Promise<CouponValidationResult> => {
  const supabase = await createServerSupabaseClient();

  // Get coupon by code (case-insensitive)
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .ilike('code', code)
    .single();

  if (error || !coupon) {
    return {
      valid: false,
      discount: 0,
      message: 'Cupón no encontrado',
    };
  }

  // Check if active
  if (!coupon.is_active) {
    return {
      valid: false,
      discount: 0,
      message: 'Este cupón ya no está activo',
    };
  }

  // Check date validity
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

  if (now < validFrom) {
    return {
      valid: false,
      discount: 0,
      message: 'Este cupón aún no es válido',
    };
  }

  if (validUntil && now > validUntil) {
    return {
      valid: false,
      discount: 0,
      message: 'Este cupón ha expirado',
    };
  }

  // Check max uses
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return {
      valid: false,
      discount: 0,
      message: 'Este cupón ha alcanzado su límite de usos',
    };
  }

  // Check if user already used this coupon
  if (userId) {
    const { data: userCoupon } = await supabase
      .from('user_coupons')
      .select('*')
      .eq('user_id', userId)
      .eq('coupon_id', coupon.id)
      .not('used_at', 'is', null)
      .single();

    if (userCoupon) {
      return {
        valid: false,
        discount: 0,
        message: 'Ya has usado este cupón anteriormente',
      };
    }
  }

  // Check minimum purchase amount
  if (cartTotal < coupon.min_purchase_amount) {
    return {
      valid: false,
      discount: 0,
      message: `Compra mínima de $${coupon.min_purchase_amount.toLocaleString()} MXN requerida para usar este cupón`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (cartTotal * coupon.discount_value) / 100;
  } else {
    // fixed
    discount = coupon.discount_value;
  }

  // Ensure discount doesn't exceed cart total
  discount = Math.min(discount, cartTotal);

  return {
    valid: true,
    discount: Math.round(discount * 100) / 100, // Round to 2 decimals
    coupon,
  };
};

/**
 * Apply coupon (mark as used)
 * Called after successful order creation
 */
export const applyCoupon = async (
  couponId: string,
  userId: string,
  orderId: string
): Promise<void> => {
  const supabase = await createServerSupabaseClient();

  // Increment current_uses
  const { error: updateError } = await supabase.rpc('increment_coupon_uses', {
    coupon_id: couponId,
  });

  if (updateError) {
    // If RPC doesn't exist, do it manually
    const { data: coupon } = await supabase
      .from('coupons')
      .select('current_uses')
      .eq('id', couponId)
      .single();

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ current_uses: coupon.current_uses + 1 })
        .eq('id', couponId);
    }
  }

  // Record user coupon usage
  await supabase.from('user_coupons').insert({
    user_id: userId,
    coupon_id: couponId,
    used_at: new Date().toISOString(),
    order_id: orderId,
  });

  console.log('✅ Coupon applied:', couponId, 'for user:', userId);
};

/**
 * Get all coupons (admin only)
 */
export const getAllCoupons = async (): Promise<Coupon[]> => {
  const coupons = await service.getTable<Coupon>('coupons', {
    order: { column: 'created_at', ascending: false },
  });

  return coupons;
};

/**
 * Create a new coupon (admin only)
 */
export const createCoupon = async (
  coupon: Omit<Coupon, 'current_uses' | 'created_at' | 'updated_at'>
): Promise<Coupon> => {
  const supabase = await createServerSupabaseClient();

  // Check if code already exists
  const { data: existing } = await supabase
    .from('coupons')
    .select('id')
    .eq('code', coupon.code)
    .single();

  if (existing) {
    throw new ApiException(400, 'Ya existe un cupón con este código');
  }

  const newCoupon = await service.createRecord<Coupon>('coupons', {
    ...coupon,
    current_uses: 0,
  });

  if (!newCoupon) {
    throw new ApiException(500, 'Error al crear el cupón');
  }

  console.log('✅ Coupon created:', newCoupon.code);

  return newCoupon;
};

/**
 * Update a coupon (admin only)
 */
export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon> => {
  // Don't allow updating current_uses through this method
  const { current_uses, ...safeUpdates } = updates;

  const updatedCoupon = await service.updateRecord<Coupon>('coupons', id, safeUpdates);

  if (!updatedCoupon) {
    throw new ApiException(404, 'Cupón no encontrado');
  }

  console.log('✅ Coupon updated:', id);

  return updatedCoupon;
};

/**
 * Delete a coupon (admin only)
 */
export const deleteCoupon = async (id: string): Promise<boolean> => {
  const success = await service.deleteRecord('coupons', id);

  if (!success) {
    throw new ApiException(404, 'Cupón no encontrado');
  }

  console.log('✅ Coupon deleted:', id);

  return true;
};

/**
 * Get coupon usage statistics
 */
export const getCouponStats = async (couponId: string): Promise<{
  totalUses: number;
  uniqueUsers: number;
  totalDiscount: number;
}> => {
  const supabase = await createServerSupabaseClient();

  const { data: usages } = await supabase
    .from('user_coupons')
    .select('user_id, order_id')
    .eq('coupon_id', couponId)
    .not('used_at', 'is', null);

  const uniqueUsers = new Set(usages?.map((u) => u.user_id) || []).size;

  // Get total discount amount from orders
  const { data: orders } = await supabase
    .from('orders')
    .select('coupon_discount')
    .eq('coupon_code', couponId);

  const totalDiscount = orders?.reduce((sum, order) => sum + (order.coupon_discount || 0), 0) || 0;

  return {
    totalUses: usages?.length || 0,
    uniqueUsers,
    totalDiscount,
  };
};
