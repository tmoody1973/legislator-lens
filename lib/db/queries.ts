// Database Query Helpers
// Reusable functions for common database operations

import { supabase } from './supabase';
import type {
  Bill,
  UserProfile,
  NewsArticle,
  Letter,
  SavedBill,
  Representative,
  EngagementTracking,
} from '@/types/database';

// =====================================================
// BILL QUERIES
// =====================================================

/**
 * Get a single bill by ID
 */
export async function getBillById(billId: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', billId)
    .single();

  if (error) throw error;
  return data as Bill;
}

/**
 * Get a bill by bill number (e.g., "hr-1234-118")
 */
export async function getBillByNumber(billNumber: string) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('bill_number', billNumber)
    .single();

  if (error) throw error;
  return data as Bill;
}

/**
 * Get recent bills with pagination
 */
export async function getRecentBills(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .order('introduced_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    bills: data as Bill[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Search bills by keyword
 */
export async function searchBills(
  query: string,
  page = 1,
  pageSize = 20
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,ai_summary_short.ilike.%${query}%`)
    .order('views_count', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    bills: data as Bill[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get bills by category
 */
export async function getBillsByCategory(
  category: string,
  page = 1,
  pageSize = 20
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('bills')
    .select('*', { count: 'exact' })
    .contains('ai_categories', [category])
    .order('introduced_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    bills: data as Bill[],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Get trending bills (by views and engagement)
 */
export async function getTrendingBills(limit = 10) {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('views_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Bill[];
}

/**
 * Increment bill view count
 */
export async function incrementBillViews(billId: string) {
  // Get current count
  const { data: bill } = await supabase
    .from('bills')
    .select('views_count')
    .eq('id', billId)
    .single();

  if (!bill) return;

  // Increment
  const { error } = await supabase
    .from('bills')
    // @ts-expect-error - Supabase type inference issue
    .update({ views_count: (bill.views_count || 0) + 1 })
    .eq('id', billId);

  if (error) console.error('Failed to increment bill views:', error);
}

// =====================================================
// USER QUERIES
// =====================================================

/**
 * Get user profile by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as UserProfile | null;
}

/**
 * Create new user profile
 */
export async function createUserProfile(
  clerkId: string,
  email: string,
  fullName?: string
) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      full_name: fullName || null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  clerkId: string,
  updates: Partial<UserProfile>
) {
  const { data, error } = await supabase
    .from('users')
    // @ts-expect-error - Supabase type inference issue
    .update(updates)
    .eq('clerk_id', clerkId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

/**
 * Complete user onboarding
 */
export async function completeOnboarding(
  clerkId: string,
  preferences: {
    preferred_categories: string[];
    engagement_level: string;
    zip_code?: string;
  }
) {
  const { data, error} = await supabase
    .from('users')
    // @ts-expect-error - Supabase type inference issue
    .update({
      ...preferences,
      onboarding_completed: true,
    })
    .eq('clerk_id', clerkId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// =====================================================
// SAVED BILLS QUERIES
// =====================================================

/**
 * Get user's saved bills
 */
export async function getUserSavedBills(userId: string) {
  const { data, error } = await supabase
    .from('saved_bills')
    .select(`
      *,
      bill:bills(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Save a bill for a user
 */
export async function saveBill(userId: string, billId: string, tags?: string[], notes?: string) {
  const { data, error } = await supabase
    .from('saved_bills')
    .insert({
      user_id: userId,
      bill_id: billId,
      tags: tags || [],
      notes: notes || null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as SavedBill;
}

/**
 * Unsave a bill
 */
export async function unsaveBill(userId: string, billId: string) {
  const { error } = await supabase
    .from('saved_bills')
    .delete()
    .eq('user_id', userId)
    .eq('bill_id', billId);

  if (error) throw error;
}

/**
 * Check if bill is saved
 */
export async function isBillSaved(userId: string, billId: string) {
  const { data, error } = await supabase
    .from('saved_bills')
    .select('id')
    .eq('user_id', userId)
    .eq('bill_id', billId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

// =====================================================
// LETTER QUERIES
// =====================================================

/**
 * Get user's letters
 */
export async function getUserLetters(userId: string) {
  const { data, error } = await supabase
    .from('letters')
    .select(`
      *,
      bill:bills(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a letter
 */
export async function createLetter(letterData: Partial<Letter>) {
  const { data, error } = await supabase
    .from('letters')
    .insert(letterData as any)
    .select()
    .single();

  if (error) throw error;
  return data as Letter;
}

/**
 * Update a letter
 */
export async function updateLetter(letterId: string, updates: Partial<Letter>) {
  const { data, error } = await supabase
    .from('letters')
    // @ts-expect-error - Supabase type inference issue
    .update(updates)
    .eq('id', letterId)
    .select()
    .single();

  if (error) throw error;
  return data as Letter;
}

/**
 * Delete a letter
 */
export async function deleteLetter(letterId: string) {
  const { error } = await supabase
    .from('letters')
    .delete()
    .eq('id', letterId);

  if (error) throw error;
}

// =====================================================
// NEWS QUERIES
// =====================================================

/**
 * Get news articles related to a bill
 */
export async function getBillNews(billId: string, limit = 10) {
  const { data, error } = await supabase
    .from('bill_news')
    .select(`
      *,
      news_article:news_articles(*)
    `)
    .eq('bill_id', billId)
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get recent news articles
 */
export async function getRecentNews(limit = 20) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as NewsArticle[];
}

// =====================================================
// REPRESENTATIVE QUERIES
// =====================================================

/**
 * Get representatives by state
 */
export async function getRepresentativesByState(state: string) {
  const { data, error } = await supabase
    .from('representatives')
    .select('*')
    .eq('state', state)
    .eq('in_office', true)
    .order('role_type', { ascending: false }); // Senators first

  if (error) throw error;
  return data as Representative[];
}

/**
 * Get representative by state and district
 */
export async function getRepresentativeByDistrict(state: string, district: string) {
  const { data, error } = await supabase
    .from('representatives')
    .select('*')
    .eq('state', state)
    .eq('district', district)
    .eq('in_office', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Representative | null;
}

// =====================================================
// ENGAGEMENT TRACKING
// =====================================================

/**
 * Track user engagement
 */
export async function trackEngagement(
  userId: string,
  engagementType: string,
  data: {
    bill_id?: string;
    news_article_id?: string;
    letter_id?: string;
    engagement_data?: any;
    points_awarded?: number;
  }
) {
  const { error } = await supabase
    .from('engagement_tracking')
    .insert({
      user_id: userId,
      engagement_type: engagementType,
      bill_id: data.bill_id || null,
      news_article_id: data.news_article_id || null,
      letter_id: data.letter_id || null,
      engagement_data: data.engagement_data || {},
      points_awarded: data.points_awarded || 0,
    } as any);

  if (error) console.error('Failed to track engagement:', error);
}

/**
 * Get user engagement stats
 */
export async function getUserEngagementStats(userId: string) {
  const { data, error } = await supabase
    .from('engagement_tracking')
    .select('engagement_type, created_at')
    .eq('user_id', userId);

  if (error) throw error;

  // Calculate stats
  const stats = {
    total_engagements: data.length,
    bills_viewed: data.filter((e: any) => e.engagement_type === 'bill_view').length,
    letters_sent: data.filter((e: any) => e.engagement_type === 'letter_sent').length,
    news_viewed: data.filter((e: any) => e.engagement_type === 'news_view').length,
  };

  return stats;
}
