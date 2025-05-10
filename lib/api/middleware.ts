// 2. SIMPLIFIED SERVER MIDDLEWARE (lib/api/middleware.ts)
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../supabase-server';
import { ApiException } from './utils';

export const withAuth = (handler) => {
  return async (req, context) => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Add user to the request for handlers
    req.user = data.session.user;
    return handler(req, context);
  };
};

export const withAdmin = (handler) => {
  return async (req, context) => {
    const supabase = createServerSupabaseClient();
    
    // Verify session exists
    const { data: sessionData, error: sessionError } = 
      await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionData.session.user.id)
      .single();
    
    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Add user to the request for handlers
    req.user = sessionData.session.user;
    return handler(req, context);
  };
};