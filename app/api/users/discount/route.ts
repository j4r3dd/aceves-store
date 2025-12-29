/**
 * User Discount API Route
 * GET /api/users/discount - Get current user's active discount
 */

import { getUserActiveDiscount } from '../../../../lib/api/handlers/users';
import { requireAuth } from '../../../../lib/api/handlers/auth';
import { withErrorHandling } from '../../../../lib/api/middleware';
import { successResponse } from '../../../../lib/api/utils';

export const GET = withErrorHandling(async () => {
    const user = await requireAuth();
    const discount = await getUserActiveDiscount(user.id);
    // Return null if no discount found, which is expected behavior for the frontend
    return successResponse(discount || null);
});
