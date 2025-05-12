// 3. SIMPLIFIED SESSION ENDPOINT (app/api/auth/session/route.ts)
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

// GET: Get current session data (useful for SSR)
export const GET = withErrorHandling(async (req: NextRequest) => {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    return successResponse({ authenticated: false });
  }
  
  // If we have a user, fetch their profile data too
  let profile = null;
  if (data.session?.user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
      
    profile = profileData;
  }
  
  return successResponse({
    authenticated: !!data.session,
    session: data.session,
    profile
  });
});