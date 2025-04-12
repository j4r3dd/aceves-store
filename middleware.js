import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // Create a response object that we'll modify
  const res = NextResponse.next();
  
  try {
    // Create the Supabase client using both request and response
    const supabase = createMiddlewareClient({ req, res });
    
    // Refresh session and get current state
    const { data } = await supabase.auth.getSession();
    
    // Log information for debugging
    console.log(`Middleware checking path: ${req.nextUrl.pathname}`);
    console.log(`Session exists: ${!!data.session}`);
    
    // Let all requests through for now - we'll handle auth in the layout
    return res;
  } catch (e) {
    console.error('Middleware error:', e);
    return res;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};