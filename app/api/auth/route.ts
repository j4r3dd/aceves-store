// app/api/auth/route.ts

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase-server';
import { 
  withErrorHandling, 
  withValidation 
} from '../../../lib/api/middleware';
import { 
  successResponse, 
  ApiException 
} from '../../../lib/api/utils';

// POST: Handle login
export const POST = withErrorHandling(
  withValidation<{ email: string; password: string }>({
    email: { type: 'string', required: true },
    password: { type: 'string', required: true, min: 6 }
  }, async (req) => {
    const { email, password } = req.validatedData;
    const supabase = createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new ApiException(401, 'Invalid credentials', error);
    }
    
    return successResponse({
      user: data.user,
      session: data.session
    });
  })
);