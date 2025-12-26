/**
 * User Profile API Route
 * GET /api/users/profile - Get current user's profile
 * PUT /api/users/profile - Update current user's profile
 */

import { NextRequest } from 'next/server';
import { getUserProfile, updateUserProfile } from '../../../../lib/api/handlers/users';
import { requireAuth } from '../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);
  return successResponse(profile);
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
  const user = await requireAuth();
  const updates = await req.json();
  const profile = await updateUserProfile(user.id, updates);
  return successResponse(profile);
});
