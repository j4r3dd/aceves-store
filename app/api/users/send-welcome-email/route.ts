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
    const supabase = await createServerSupabaseClient();

    // Get authenticated user first
    console.log('📧 [API] Fetching authenticated user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('❌ [API] User auth fetch error:', userError);
      return successResponse({ sent: false, reason: 'User not authenticated' });
    }

    if (!user?.email) {
      console.warn('⚠️ [API] No email found for user');
      return successResponse({ sent: false, reason: 'Email not found' });
    }

    // Check if welcome email was already sent
    if (user.user_metadata?.welcome_email_sent) {
      console.log('✨ [API] Welcome email already sent to:', user.email);
      return successResponse({ sent: false, reason: 'Already sent', alreadySent: true });
    }

    console.log('📧 [API] User authenticated:', { email: user.email, id: user.id });

    // Now fetch the profile to get the user's name
    console.log('📧 [API] Fetching user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nombre')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ [API] Profile fetch error:', profileError);
    } else {
      console.log('📧 [API] Profile found:', { nombre: profile?.nombre });
    }

    // Use the profile name, or fall back to '¿Cómo estás?' if not found
    const userName = profile?.nombre || '¿Cómo estás?';

    // Send welcome email (don't fail if it doesn't work)
    try {
      console.log('📧 [API] Calling emailService.sendWelcomeEmail with name:', userName);
      const result = await emailService.sendWelcomeEmail(
        user.email,
        userName
      );

      console.log('✅ [API] Welcome email sent successfully to:', user.email);
      console.log('📧 [API] Resend response:', result);

      // Mark as sent in user metadata
      await supabase.auth.updateUser({
        data: { welcome_email_sent: true }
      });
      console.log('✅ [API] Updated user metadata: welcome_email_sent = true');

      return successResponse({ sent: true, emailId: result?.id });
    } catch (error) {
      console.error('❌ [API] Failed to send welcome email:', error);
      console.error('❌ [API] Error details:', JSON.stringify(error, null, 2));
      // Don't fail the request - welcome email is nice-to-have
      return successResponse({ sent: false, error: error instanceof Error ? error.message : 'Failed to send email' });
    }
  })
);
