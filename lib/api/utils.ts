// lib/api/utils.ts - Add cn utility function for merging classNames
import { NextResponse } from 'next/server';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

// Add the cn utility function for merging classnames
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type ApiError = {
  status: number;
  message: string;
  details?: unknown;
}

export class ApiException extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiException';
  }
}

export const handleError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiException) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status }
    );
  }
  
  // Handle Supabase errors
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};

export const successResponse = <T>(data: T, status = 200) => {
  return NextResponse.json(data, { status });
};