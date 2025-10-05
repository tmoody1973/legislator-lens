// Clerk + Supabase Integration Helpers
// Sync Clerk users with Supabase database

import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/db/supabase';
import { getUserByClerkId, createUserProfile } from '@/lib/db/queries';
import type { UserProfile } from '@/types/database';

/**
 * Get or create Supabase user profile from Clerk session
 * This function ensures every Clerk user has a corresponding Supabase profile
 */
export async function getOrCreateUserProfile(): Promise<UserProfile | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user exists in Supabase
  const existingUser = await getUserByClerkId(userId);

  if (existingUser) {
    return existingUser;
  }

  // User doesn't exist, create profile
  // Note: In production, you'd want to get email from Clerk user object
  // For now, we'll use a placeholder - this should be improved with Clerk webhooks
  try {
    const newUser = await createUserProfile(
      userId,
      `user-${userId}@temp.email`, // Temporary email - should be replaced via webhook
      undefined
    );
    return newUser;
  } catch (error) {
    console.error('Failed to create user profile:', error);
    return null;
  }
}

/**
 * Get Supabase client with Clerk auth token
 * This enables RLS policies to work correctly with Clerk authentication
 */
export async function getAuthenticatedSupabaseClient() {
  const { getToken } = await auth();

  // Get Supabase token from Clerk
  const supabaseToken = await getToken({ template: 'supabase' });

  if (!supabaseToken) {
    throw new Error('Failed to get Supabase token from Clerk');
  }

  return createServerSupabaseClient(supabaseToken);
}
