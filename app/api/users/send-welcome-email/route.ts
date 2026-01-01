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

    // Get user profile to get name and email
    const supabase = await createServerSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre')
      .eq('id', userId)
      .single();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return successResponse({ sent: false, reason: 'Email not found' });
    }

    // Send welcome email (don't fail if it doesn't work)
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        profile?.nombre || 'Cliente'
      );

      console.log('✅ Welcome email sent to:', user.email);

      return successResponse({ sent: true });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the request - welcome email is nice-to-have
      return successResponse({ sent: false, error: 'Failed to send email' });
    }
  })
);
