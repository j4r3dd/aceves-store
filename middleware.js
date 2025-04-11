import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
  try {
    // Explicitly provide the URL and key to prevent errors
    const supabase = createMiddlewareClient({ req, res }, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    
    // Refresh session if needed
    await supabase.auth.getSession();
    
    // If path is /admin, check for authentication
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      // If there's no session and not trying to access the login page
      if (!session && !req.nextUrl.pathname.endsWith('/admin')) {
        // Redirect to login
        const redirectUrl = new URL('/admin', req.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (e) {
    console.error('Middleware error:', e);
    // Continue even if there's an error with auth
  }
  
  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};