import { createClient } from '@supabase/supabase-js';

// Make sure environment variables are properly checked before using
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing! Please check your .env.local file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || '',  // Provide fallback empty string to prevent errors
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);