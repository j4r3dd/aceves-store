// lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a single supabase client for browser-side use
export const supabase = createClientComponentClient();