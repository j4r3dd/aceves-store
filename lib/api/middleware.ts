// lib/api/middleware.ts - Common API middleware functions
import { NextRequest, NextResponse } from 'next/server';
import { ApiException } from './utils';

export type NextApiHandler = (
  req: NextRequest,
  context: { params?: Record<string, string | string[]> }
) => Promise<NextResponse> | NextResponse;

export const withErrorHandling = (handler: NextApiHandler): NextApiHandler => {
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
};

export const withAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req, context) => {
    // Authentication logic would go here
    // For now, just pass through
    return handler(req, context);
  };
};

export const withValidation = <T>(
  schema: any,
  handler: (req: NextRequest & { validatedData: T }, context: { params?: Record<string, string | string[]> }) => Promise<NextResponse> | NextResponse
): NextApiHandler => {
  return async (req, context) => {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      throw new ApiException(400, 'Invalid JSON body');
    }

    // Here you would validate with your schema
    // For now we'll just pass through
    const validatedReq = req as NextRequest & { validatedData: T };
    validatedReq.validatedData = body as T;
    
    return handler(validatedReq, context);
  };
};