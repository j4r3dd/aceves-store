// lib/tiktokPixel.js
'use client';

// Hash function for PII data (email, phone)
function hashData(data) {
  if (!data) return '';
  // In production, use crypto.subtle.digest for SHA-256 hashing
  // For now, we'll return the data as-is (you should implement proper hashing)
  return data;
}

// Generate unique event ID
function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize TikTok Pixel events
export const tiktokPixel = {
  // Track page views (automatic with ttq.page())
  
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
    }
  },

  // Track purchase completion
  trackPurchase: (orderData) => {
    if (typeof window !== 'undefined' && window.ttq) {
      // Identify user with hashed PII (optional but recommended)
      if (orderData.email) {
        window.ttq.identify({
          email: hashData(orderData.email),
          external_id: orderData.orderId
        });
      }

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
    }
  }
};