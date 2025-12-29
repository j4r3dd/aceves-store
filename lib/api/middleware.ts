// lib/api/middleware.ts - Updated with auth middleware

import { NextRequest, NextResponse } from 'next/server';
import { ApiException } from './utils';
import { requireAuth, requireAdmin } from './handlers/auth';
import { validateInput } from './validation';

export type NextApiHandler = (
  req: NextRequest,
  context: { params?: Record<string, string | string[]> | Promise<Record<string, string>> }
) => Promise<NextResponse> | NextResponse;

// Export as standalone function (this is what your API routes are importing)
export function withErrorHandling(handler: NextApiHandler): NextApiHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof ApiException) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, context) => {
    try {
      // This will throw if not authenticated
      await requireAuth();
      return handler(req, context);
    } catch (error) {
      if (error instanceof ApiException) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
  };
}

export function withAdmin(handler: NextApiHandler): NextApiHandler {
  return async (req, context) => {
    try {
      // This will throw if not admin
      await requireAdmin();
      return handler(req, context);
    } catch (error) {
      if (error instanceof ApiException) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  };
}

export function withValidation<T>(
  schema: any,
  handler: (req: NextRequest & { validatedData: T }, context: { params?: Record<string, string | string[]> | Promise<Record<string, string>> }) => Promise<NextResponse> | NextResponse
): NextApiHandler {
  return async (req, context) => {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      throw new ApiException(400, 'Invalid JSON body');
    }

    // Use the validation utility
    try {
      const validatedData = validateInput<T>(body, schema);
      const validatedReq = req as NextRequest & { validatedData: T };
      validatedReq.validatedData = validatedData;
      
      return handler(validatedReq, context);
    } catch (error) {
      if (error instanceof ApiException) {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { error: 'Validation error' },
        { status: 400 }
      );
    }
  };
}