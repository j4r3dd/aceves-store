import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    // Create a response object - we'll update it with cookies
    let supabaseResponse = NextResponse.next({
        request,
    });

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // IMPORTANT: This triggers the cookie refresh
    // The refreshed cookies are set on supabaseResponse
    await supabase.auth.getUser();

    // Generate a random nonce for the CSP (optional but good practice if we want to tighten it later)
    // For now we rely on unsafe-inline/eval to fix the immediate PayPal issue
    const nonce = crypto.randomUUID();

    // Define Content Security Policy
    // Crucially adding 'unsafe-eval' for script-src to fix PayPal SDK issue
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.paypal.com https://*.paypalobjects.com https://analytics.tiktok.com https://*.tiktok.com https://www.google-analytics.com https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.paypal.com https://*.paypalobjects.com https://*.vercel-storage.com https://*.tiktok.com;
    font-src 'self' https://fonts.gstatic.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://*.paypal.com https://*.paypalobjects.com https://analytics.tiktok.com https://*.tiktok.com https://*.supabase.co;
    frame-src 'self' https://*.paypal.com https://*.paypalobjects.com;
  `;

    // Replace newlines with spaces for the header value
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim();

    // Set headers on the supabase response (which has updated cookies)
    supabaseResponse.headers.set('x-nonce', nonce);
    supabaseResponse.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
    supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname);

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Note: We now include API routes to refresh Supabase sessions
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
