// lib/tiktokPixel.js
'use client';

// SHA-256 hashing function for PII data
async function hashData(data) {
  if (!data || typeof window === 'undefined') return '';

  try {
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.toLowerCase().trim());

    // Hash the data
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error hashing data:', error);
    return '';
  }
}

// Generate unique event ID
function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize TikTok Pixel events
export const tiktokPixel = {
  // Track page views (automatic with ttq.page() in base code)

  // Track product views
  trackViewContent: (product) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewContent', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name
        }],
        value: product.price,
        currency: 'MXN'
      }, {
        event_id: generateEventId()
      });

      console.log('🔍 TikTok: ViewContent tracked for', product.name);
    }
  },

  // Track add to cart
  trackAddToCart: (product, quantity = 1) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('AddToCart', {
        contents: [{
          content_id: product.id,
          content_type: 'product',
          content_name: product.name
        }],
        value: product.price * quantity,
        currency: 'MXN'
      }, {
        event_id: generateEventId()
      });

      console.log('🛒 TikTok: AddToCart tracked for', product.name);
    }
  },

  // Track checkout initiation
  trackInitiateCheckout: (cartItems) => {
    if (typeof window !== 'undefined' && window.ttq) {
      const contents = cartItems.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.name
      }));

      const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      window.ttq.track('InitiateCheckout', {
        contents,
        value: totalValue,
        currency: 'MXN'
      }, {
        event_id: generateEventId()
      });

      console.log('🏁 TikTok: InitiateCheckout tracked with', cartItems.length, 'items');
    }
  },

  // Track payment info addition
  trackAddPaymentInfo: (cartItems) => {
    if (typeof window !== 'undefined' && window.ttq) {
      const contents = cartItems.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.name
      }));

      const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      window.ttq.track('AddPaymentInfo', {
        contents,
        value: totalValue,
        currency: 'MXN'
      }, {
        event_id: generateEventId()
      });

      console.log('💳 TikTok: AddPaymentInfo tracked');
    }
  },

  // Track purchase completion with PII identification
  trackPurchase: async (orderData) => {
    if (typeof window !== 'undefined' && window.ttq) {
      try {
        // Identify user with hashed PII (recommended for better tracking)
        if (orderData.email || orderData.phone) {
          const identifyData = {};

          if (orderData.email) {
            identifyData.email = await hashData(orderData.email);
          }

          if (orderData.phone) {
            identifyData.phone_number = await hashData(orderData.phone);
          }

          if (orderData.orderId) {
            identifyData.external_id = await hashData(orderData.orderId);
          }

          // Identify user before tracking purchase
          window.ttq.identify(identifyData);
          console.log('👤 TikTok: User identified');
        }

        // Track the purchase event
        const contents = orderData.items.map(item => ({
          content_id: item.product_id || item.id,
          content_type: 'product',
          content_name: item.product_name || item.name
        }));

        window.ttq.track('Purchase', {
          contents,
          value: orderData.total,
          currency: 'MXN'
        }, {
          event_id: generateEventId()
        });

        console.log('🎉 TikTok: Purchase tracked for $', orderData.total, 'MXN');
      } catch (error) {
        console.error('Error tracking purchase:', error);
      }
    }
  },

  // Track custom events (optional)
  trackCustomEvent: (eventName, data = {}) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(eventName, data, {
        event_id: generateEventId()
      });

      console.log('🔄 TikTok: Custom event tracked:', eventName);
    }
  },

  // Test function to verify pixel is working
  testPixel: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      console.log('✅ TikTok Pixel is loaded and ready');
      return true;
    } else {
      console.error('❌ TikTok Pixel not found');
      return false;
    }
  },

  // Add these methods to your existing tiktokPixel object in lib/tiktokPixel.js

  // Send server-side events via API
  sendServerEvent: async (eventType, eventData, userContext = {}) => {
    try {
      const response = await fetch('/api/tiktok-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          eventData,
          userContext
        })
      });

      if (!response.ok) {
        // Just log warning, don't throw to disrupt flow
        console.warn(`Server event warning: ${response.statusText}`);
        return null;
      }

      const result = await response.json();
      // console.log(`📡 TikTok Server Event sent: ${eventType}`, result);
      return result;
    } catch (error) {
      // Catch network errors silently
      console.warn('Network warning sending server event:', error);
      return null;
    }
  },

  // Enhanced ViewContent that sends both client and server events
  trackViewContentEnhanced: async (product, userContext = {}) => {
    // Send client-side event (existing)
    tiktokPixel.trackViewContent(product);

    // Send server-side event (new)
    await tiktokPixel.sendServerEvent('ViewContent', product, userContext);
  },

  // Enhanced AddToCart that sends both client and server events
  trackAddToCartEnhanced: async (product, quantity = 1, userContext = {}) => {
    // Send client-side event (existing)
    tiktokPixel.trackAddToCart(product, quantity);

    // Send server-side event (new)
    await tiktokPixel.sendServerEvent('AddToCart', { ...product, quantity }, userContext);
  },

  // Enhanced InitiateCheckout that sends both client and server events
  trackInitiateCheckoutEnhanced: async (cartItems, userContext = {}) => {
    // Send client-side event (existing)
    tiktokPixel.trackInitiateCheckout(cartItems);

    // Calculate total for server event
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Send server-side event (new)
    await tiktokPixel.sendServerEvent('InitiateCheckout', { cartItems, total }, userContext);
  },

  // Enhanced Purchase that sends both client and server events
  trackPurchaseEnhanced: async (orderData, userContext = {}) => {
    // Send client-side event (existing)
    tiktokPixel.trackPurchase(orderData);

    // Send server-side event (new) 
    await tiktokPixel.sendServerEvent('Purchase', orderData, userContext);
  },

  // Enhanced AddPaymentInfo that sends both client and server events
  trackAddPaymentInfoEnhanced: async (cartItems, userContext = {}) => {
    // Send client-side event (existing)
    tiktokPixel.trackAddPaymentInfo(cartItems);

    // Calculate total for server event
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Send server-side event (new)
    await tiktokPixel.sendServerEvent('InitiateCheckout', { cartItems, total }, userContext);
  }

};

if (typeof window !== 'undefined') {
  window.tiktokPixel = tiktokPixel;
}