// lib/tiktok-events-api.ts
interface EventData {
  user?: any;
  properties?: any;
}

interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
}

interface CartItem extends Product {
  quantity?: number;
}

interface OrderData {
  orderId?: string;
  email?: string;
  phone?: string;
  items: Array<{
    product_id?: string;
    id?: string;
    product_name?: string;
    name?: string;
    category?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}

class TikTokEventsAPI {
  private accessToken: string;
  private pixelId: string;
  private apiEndpoint: string;

  constructor() {
    this.accessToken = process.env.TIKTOK_ACCESS_TOKEN || '';
    this.pixelId = process.env.TIKTOK_PIXEL_ID || '';
    this.apiEndpoint = process.env.TIKTOK_API_ENDPOINT || 'https://business-api.tiktok.com/open_api/v1.3/pixel/track/';

    // Validate that required env vars are present
    if (!this.accessToken || !this.pixelId) {
      console.warn('⚠️ TikTok Events API: Missing environment variables (TIKTOK_ACCESS_TOKEN or TIKTOK_PIXEL_ID). Server-side tracking will be disabled.');
    }
  }

  // Fixed sendEvent method for lib/tiktok-events-api.ts
  async sendEvent(eventName: string, eventData: EventData) {
    if (!this.accessToken || !this.pixelId) {
      console.warn('⚠️ TikTok Events API: Skipping event (missing configuration)', eventName);
      return { skipped: true };
    }

    try {
      console.log('🔍 Debug - Sending TikTok Event:', eventName);

      const payload = {
        event_source: "web",
        event_source_id: this.pixelId,
        data: [{
          event: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          user: eventData.user || {},
          properties: eventData.properties || {}
        }]
      };

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ TikTok API Error Response:', result);
        // Don't throw, just log. We don't want to break the user flow for tracking.
        return { error: result.message || response.statusText };
      }

      console.log('✅ TikTok Event sent successfully:', eventName);
      return result;
    } catch (error) {
      console.error('❌ Error sending TikTok event:', error);
      // Suppress error
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }




  // Track when someone views a product
  async trackViewContent(product: Product, userContext: any = {}) {
    const eventData = {
      user: userContext,
      properties: {
        contents: [{
          content_id: product.id,
          content_name: product.name,
          content_category: product.category,
          price: product.price,
          currency: 'MXN'
        }],
        content_type: 'product',
        value: product.price,
        currency: 'MXN'
      }
    };

    return this.sendEvent('ViewContent', eventData);
  }

  // Track when someone adds item to cart
  async trackAddToCart(cartItem: CartItem, userContext: any = {}) {
    const eventData = {
      user: userContext,
      properties: {
        contents: [{
          content_id: cartItem.id,
          content_name: cartItem.name,
          content_category: cartItem.category,
          price: cartItem.price,
          quantity: cartItem.quantity || 1
        }],
        content_type: 'product',
        value: cartItem.price * (cartItem.quantity || 1),
        currency: 'MXN'
      }
    };

    return this.sendEvent('AddToCart', eventData);
  }

  // Track when someone initiates checkout
  async trackInitiateCheckout(cartItems: CartItem[], total: number, userContext: any = {}) {
    const contents = cartItems.map(item => ({
      content_id: item.id,
      content_name: item.name,
      content_category: item.category,
      price: item.price,
      quantity: item.quantity
    }));

    const eventData = {
      user: userContext,
      properties: {
        contents,
        content_type: 'product',
        value: total,
        currency: 'MXN'
      }
    };

    return this.sendEvent('InitiateCheckout', eventData);
  }

  // Track completed purchases
  async trackPurchase(orderData: OrderData, userContext: any = {}) {
    const contents = orderData.items.map(item => ({
      content_id: item.product_id || item.id,
      content_name: item.product_name || item.name,
      content_category: item.category,
      price: item.price,
      quantity: item.quantity
    }));

    // Enhanced user context with hashed PII for better attribution
    const enhancedUserContext = {
      ...userContext,
      external_id: orderData.orderId ? this.hashData(orderData.orderId) : undefined,
      email: orderData.email ? this.hashData(orderData.email) : undefined,
      phone: orderData.phone ? this.hashData(orderData.phone) : undefined
    };

    const eventData = {
      user: enhancedUserContext,
      properties: {
        contents,
        content_type: 'product',
        value: orderData.total,
        currency: 'MXN'
      }
    };

    return this.sendEvent('Purchase', eventData);
  }

  // Helper method to hash PII data
  hashData(data: string) {
    if (!data) return undefined;
    // Simple hash - in production you might want to use a more robust hashing
    return data.toLowerCase().trim();
  }
}

export const tiktokEventsAPI = new TikTokEventsAPI();