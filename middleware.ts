
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
    connect-src 'self' https://*.paypal.com https://*.paypalobjects.com https://analytics.tiktok.com https://*.tiktok.com;
    frame-src 'self' https://*.paypal.com https://*.paypalobjects.com;
  `;

    // Replace newlines with spaces for the header value
    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, ' ')
        .trim();

    // Create response
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    // Also pass x-pathname for layout.js usage
    requestHeaders.set('x-pathname', request.nextUrl.pathname);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Set the CSP header on the response so the browser sees it
    response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
