// app/api/auth/logout/route.ts

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { 
  withErrorHandling, 
  withAuth 
} from '../../../../lib/api/middleware';
import { 
  successResponse, 
  ApiException 
} from '../../../../lib/api/utils';

// POST: Handle logout (requires authentication)
export const POST = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new ApiException(500, 'Failed to sign out', error);
    }
    
    return successResponse({
      message: 'Successfully signed out'
    });
  })
);