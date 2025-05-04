// app/api/auth/register/route.ts

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { 
  withErrorHandling, 
  withValidation,
  withAdmin 
} from '../../../../lib/api/middleware';
import { 
  successResponse, 
  ApiException 
} from '../../../../lib/api/utils';

// POST: Handle admin user registration (admin only)
export const POST = withErrorHandling(
  withAdmin(
    withValidation<{ email: string; password: string; name?: string }>({
      email: { type: 'string', required: true },
      password: { type: 'string', required: true, min: 8 },
      name: { type: 'string' }
    }, async (req) => {
      const { email, password, name } = req.validatedData;
      const supabase = createServerSupabaseClient();
      
      // Create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      });
      
      if (error) {
        throw new ApiException(400, 'Failed to create user', error);
      }
      
      // Set up profile with admin role
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: name || email.split('@')[0],
          role: 'admin'
        });
      }
      
      return successResponse({
        message: 'Admin user created successfully',
        user: data.user
      }, 201);
    })
  )
);