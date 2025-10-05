// Supabase Client Configuration
// Provides typed Supabase client instances for server and client-side usage

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Client-side Supabase client
 * Use this in client components and pages
 * Automatically handles user session and RLS policies
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Create a Supabase client for server-side usage
 * Use this in API routes and server components
 *
 * @param supabaseAccessToken - Optional access token from Clerk
 * @returns Typed Supabase client
 */
export function createServerSupabaseClient(supabaseAccessToken?: string) {
  return createClient<Database>(
    supabaseUrl!,
    supabaseAccessToken || supabaseAnonKey!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * Admin Supabase client with service role key
 * Use only in secure server-side contexts (API routes, server actions)
 * Bypasses RLS policies - use with caution!
 */
export function createAdminSupabaseClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
