/**
 * Order Management Handlers
 */

import { SupabaseService } from '../services/supabase-service';
import { ApiException } from '../utils';
import { createServerSupabaseClient } from '../../supabase-server';
import { emailService, OrderEmailData } from '../../email-service';

// Types
export interface Order {
  id?: string;
  paypal_order_id: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    calle: string;
    colonia: string;
    ciudad: string;
    cp: string;
    pais: string;
  };
  secondary_shipping_address?: {
    calle: string;
    colonia: string;
    ciudad: string;
    cp: string;
    pais: string;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    selected_size?: string;
  }>;
  total_amount: number;
  original_total?: number;
  coupon_code?: string;
  coupon_discount?: number;
  user_discount?: number;
  status: string;
  shipping_status: 'pending' | 'paid' | 'shipped' | 'delivered';
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  is_guest: boolean;
  is_envio_cruzado?: boolean;
  address_1_notes?: string;
  address_2_notes?: string;
  created_at?: string;
}

const service = SupabaseService.getInstance();

/**
 * Get all orders for a specific user
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const orders = await service.getTable<Order>('orders', {
    filter: { user_id: userId },
    order: { column: 'created_at', ascending: false },
  });

  return orders;
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  const order = await service.getRecord<Order>('orders', orderId);

  if (!order) {
    throw new ApiException(404, 'Pedido no encontrado');
  }

  return order;
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Order[]> => {
  const queryOptions: any = {
    order: { column: 'created_at', ascending: false },
  };

  if (filters?.status) {
    queryOptions.filter = { shipping_status: filters.status };
  }

  if (filters?.limit) {
    queryOptions.limit = filters.limit;
  }

  const orders = await service.getTable<Order>('orders', queryOptions);

  return orders;
};

/**
 * Create a new order
 * Sends order confirmation email automatically
 */
export const createOrder = async (orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> => {
  const supabase = createServerSupabaseClient();

  // Create the order
  const order = await service.createRecord<Order>('orders', {
    ...orderData,
    created_at: new Date().toISOString(),
  });

  if (!order) {
    throw new ApiException(500, 'Error al crear el pedido');
  }

  console.log('✅ Order created:', order.id);

  // Send order confirmation email (fire and forget - don't block order creation)
  const emailData: OrderEmailData = {
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    orderId: order.paypal_order_id,
    items: order.items,
    total: order.total_amount,
    originalTotal: order.original_total,
    couponDiscount: order.coupon_discount,
    userDiscount: order.user_discount,
    shippingAddress: order.shipping_address,
  };

  emailService.sendOrderConfirmation(emailData).catch((err) => {
    console.error('❌ Failed to send order confirmation email:', err);
    // Don't throw - order was created successfully
  });

  // Save guest email for marketing if it's a guest order
  if (order.is_guest && order.customer_email) {
    const { data: existingGuest } = await supabase
      .from('guest_emails')
      .select('*')
      .eq('email', order.customer_email)
      .single();

    if (existingGuest) {
      // Update existing guest email record
      await supabase
        .from('guest_emails')
        .update({
          total_orders: existingGuest.total_orders + 1,
          last_order_at: new Date().toISOString(),
        })
        .eq('email', order.customer_email);
    } else {
      // Create new guest email record
      await supabase.from('guest_emails').insert({
        email: order.customer_email,
        first_order_id: order.paypal_order_id,
        total_orders: 1,
        last_order_at: new Date().toISOString(),
      });
    }
  }

  return order;
};

/**
 * Update order status
 * Sends shipping notification email when status changes to 'shipped'
 */
export const updateOrderStatus = async (
  orderId: string,
  status: 'paid' | 'shipped' | 'delivered',
  trackingNumber?: string
): Promise<Order> => {
  const supabase = createServerSupabaseClient();

  const updates: Partial<Order> = {
    shipping_status: status,
  };

  if (status === 'shipped') {
    updates.shipped_at = new Date().toISOString();
    if (trackingNumber) {
      updates.tracking_number = trackingNumber;
    }
  }

  if (status === 'delivered') {
    updates.delivered_at = new Date().toISOString();
  }

  const order = await service.updateRecord<Order>('orders', orderId, updates);

  if (!order) {
    throw new ApiException(404, 'Pedido no encontrado');
  }

  console.log('✅ Order status updated:', orderId, '→', status);

  // Send shipping notification email if status changed to shipped
  if (status === 'shipped') {
    const emailData: OrderEmailData = {
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      orderId: order.paypal_order_id,
      items: order.items,
      total: order.total_amount,
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
    };

    emailService.sendShippingNotification(emailData).catch((err) => {
      console.error('❌ Failed to send shipping notification email:', err);
      // Don't throw - order was updated successfully
    });
  }

  return order;
};

/**
 * Search orders by customer email (admin only)
 */
export const searchOrdersByEmail = async (email: string): Promise<Order[]> => {
  const supabase = createServerSupabaseClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .ilike('customer_email', `%${email}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching orders:', error);
    throw new ApiException(500, error.message);
  }

  return orders || [];
};

/**
 * Get order statistics (admin only)
 */
export const getOrderStats = async (): Promise<{
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}> => {
  const supabase = createServerSupabaseClient();

  // Get total orders and revenue
  const { data: orders } = await supabase.from('orders').select('total_amount, shipping_status');

  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Count orders by status
  const ordersByStatus: Record<string, number> = {
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
  };

  orders?.forEach((order) => {
    const status = order.shipping_status || 'pending';
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
  });

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    ordersByStatus,
  };
};
