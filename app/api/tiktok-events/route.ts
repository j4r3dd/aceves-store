// app/api/tiktok-events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tiktokEventsAPI } from '../../../lib/tiktok-events-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventData, userContext } = body;

    let result;

    switch (eventType) {
      case 'ViewContent':
        result = await tiktokEventsAPI.trackViewContent(eventData, userContext);
        break;
      
      case 'AddToCart':
        result = await tiktokEventsAPI.trackAddToCart(eventData, userContext);
        break;
      
      case 'InitiateCheckout':
        result = await tiktokEventsAPI.trackInitiateCheckout(
          eventData.cartItems, 
          eventData.total, 
          userContext
        );
        break;
      
      case 'Purchase':
        result = await tiktokEventsAPI.trackPurchase(eventData, userContext);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid event type' }, 
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('TikTok Events API error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}