/**
 * Send Welcome Email API Route
 * POST /api/users/send-welcome-email
 * Sends welcome email to user after email confirmation
 */

import { NextRequest } from 'next/server';
import { withErrorHandling, withAuth } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';
import { emailService } from '../../../../lib/email-service';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';

export const POST = withErrorHandling(
  withAuth(async (req: NextRequest) => {
    const userId = (req as any).user?.id;

    console.log('📧 [API] Welcome email endpoint called for user:', userId);

    // Get user profile to get name and email
    const supabase = await createServerSupabaseClient();

    console.log('📧 [API] Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nombre')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ [API] Profile fetch error:', profileError);
    } else {
      console.log('📧 [API] Profile found:', { nombre: profile?.nombre });
    }

    console.log('📧 [API] Fetching user auth data...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('❌ [API] User auth fetch error:', userError);
    } else {
      console.log('📧 [API] User auth data:', { email: user?.email, id: user?.id });
    }

    if (!user?.email) {
      console.warn('⚠️ [API] No email found for user');
      return successResponse({ sent: false, reason: 'Email not found' });
    }

    // Send welcome email (don't fail if it doesn't work)
    try {
      console.log('📧 [API] Calling emailService.sendWelcomeEmail...');
      const result = await emailService.sendWelcomeEmail(
        user.email,
        profile?.nombre || 'Cliente'
      );

      console.log('✅ [API] Welcome email sent successfully to:', user.email);
      console.log('📧 [API] Resend response:', result);

      return successResponse({ sent: true, emailId: result?.id });
    } catch (error) {
      console.error('❌ [API] Failed to send welcome email:', error);
      console.error('❌ [API] Error details:', JSON.stringify(error, null, 2));
      // Don't fail the request - welcome email is nice-to-have
      return successResponse({ sent: false, error: error instanceof Error ? error.message : 'Failed to send email' });
    }
  })
);
