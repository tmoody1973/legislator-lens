// Database Types for Legislator Lens
// Auto-generated types matching Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// USER TYPES
// =====================================================

export type EngagementLevel = 'stay_informed' | 'take_action' | 'deep_analysis';

export interface UserProfile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;

  // Preferences
  preferred_categories: string[];
  engagement_level: EngagementLevel;
  notification_preferences: {
    email: boolean;
    push: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
  };

  // Location
  zip_code: string | null;
  state: string | null;
  district: string | null;

  // Civic Score
  civic_score: number;
  knowledge_points: number;
  action_points: number;
  community_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;

  // Privacy
  privacy_settings: {
    profile_visibility: 'public' | 'private';
    share_metrics: boolean;
  };

  // Metadata
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// BILL TYPES
// =====================================================

export type BillType = 'hr' | 's' | 'hjres' | 'sjres' | 'hconres' | 'sconres' | 'hres' | 'sres';

export interface BillSponsor {
  name: string;
  party: string;
  state: string;
  bioguide_id: string;
}

export interface Cosponsor {
  name: string;
  party: string;
  state: string;
  bioguide_id: string;
  sponsored_date: string;
}

export interface KeyProvision {
  section: string;
  title: string;
  summary: string;
  impact_level: 'high' | 'medium' | 'low';
  stakeholders_affected: string[];
}

export interface ImpactAnalysis {
  economic: {
    summary: string;
    affected_sectors: string[];
    fiscal_impact: string;
  };
  social: {
    summary: string;
    affected_groups: string[];
    equity_considerations: string;
  };
  environmental: {
    summary: string;
    sustainability_impact: string;
  };
}

export interface StakeholderPerspective {
  stakeholder_type: string;
  position: 'support' | 'oppose' | 'neutral';
  reasoning: string;
  key_concerns: string[];
}

export interface VisualPrompt {
  perspective: 'economic' | 'social' | 'environmental';
  prompt: string;
  image_url?: string;
}

export interface Bill {
  id: string;

  // Congress.gov data
  bill_number: string;
  bill_type: BillType;
  congress: number;
  title: string;
  short_title: string | null;
  official_title: string | null;

  // Content
  summary: string | null;
  full_text: string | null;
  full_text_url: string | null;

  // Status
  status: string;
  introduced_date: string | null;
  latest_action_date: string | null;
  latest_action_text: string | null;

  // Sponsor
  sponsor_name: string | null;
  sponsor_party: string | null;
  sponsor_state: string | null;
  sponsor_bioguide_id: string | null;

  // Cosponsors
  cosponsors_count: number;
  cosponsors: Cosponsor[];

  // Categories
  ai_categories: string[];
  policy_areas: string[];
  subjects: string[];

  // AI Analysis Cache
  ai_summary_short: string | null;
  ai_summary_medium: string | null;
  ai_summary_long: string | null;
  ai_key_provisions: KeyProvision[];
  ai_impact_analysis: ImpactAnalysis | null;
  ai_stakeholder_perspectives: StakeholderPerspective[];
  ai_visual_prompts: VisualPrompt[];
  ai_processed_at: string | null;

  // Engagement
  views_count: number;
  saves_count: number;
  shares_count: number;
  letters_count: number;

  // External links
  congress_gov_url: string | null;
  govtrack_url: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// =====================================================
// NEWS ARTICLE TYPES
// =====================================================

export type NewsSourceAPI = 'newsapi' | 'guardian' | 'manual';

export interface NewsArticle {
  id: string;

  // Article metadata
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image_url: string | null;

  // Source
  source_name: string;
  source_api: NewsSourceAPI;
  author: string | null;
  published_at: string;

  // AI processing
  ai_summary: string | null;
  ai_relevance_score: number | null;
  ai_key_themes: string[];
  ai_processed_at: string | null;

  // Engagement
  views_count: number;

  // Metadata
  created_at: string;
  updated_at: string;
}

// =====================================================
// BILL-NEWS JUNCTION TYPES
// =====================================================

export interface BillNewsRelation {
  id: string;
  bill_id: string;
  news_article_id: string;
  relevance_score: number | null;
  created_at: string;
}

// =====================================================
// LETTER TYPES
// =====================================================

export type LetterPosition = 'support' | 'oppose' | 'neutral';
export type RecipientType = 'representative' | 'senator' | 'local' | 'other';
export type DeliveryMethod = 'platform' | 'email' | 'pdf' | 'copy' | 'social';
export type DeliveryStatus = 'draft' | 'sent' | 'delivered' | 'failed';
export type AIInputMode = 'text' | 'voice' | 'image';
export type AITone = 'formal' | 'casual' | 'passionate';

export interface Letter {
  id: string;
  user_id: string;
  bill_id: string | null;

  // Content
  subject: string;
  content: string;
  position: LetterPosition | null;

  // Recipient
  recipient_name: string;
  recipient_title: string | null;
  recipient_type: RecipientType | null;
  recipient_state: string | null;
  recipient_district: string | null;

  // AI assistance
  ai_assisted: boolean;
  ai_input_mode: AIInputMode[];
  ai_tone: AITone | null;
  ai_quality_score: number | null;

  // Delivery
  delivery_method: DeliveryMethod | null;
  delivered_at: string | null;
  delivery_status: DeliveryStatus;

  // Metadata
  created_at: string;
  updated_at: string;
}

// =====================================================
// ENGAGEMENT TRACKING TYPES
// =====================================================

export type EngagementType =
  | 'bill_view'
  | 'bill_save'
  | 'bill_share'
  | 'bill_read_time'
  | 'news_view'
  | 'news_share'
  | 'letter_draft'
  | 'letter_sent'
  | 'search'
  | 'category_browse'
  | 'achievement_unlock'
  | 'streak_milestone';

export interface EngagementTracking {
  id: string;
  user_id: string;

  // Type and targets
  engagement_type: EngagementType;
  bill_id: string | null;
  news_article_id: string | null;
  letter_id: string | null;

  // Data
  engagement_data: Json;

  // Points
  points_awarded: number;

  // Metadata
  created_at: string;
}

// =====================================================
// ACHIEVEMENT TYPES
// =====================================================

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserAchievement {
  id: string;
  user_id: string;

  // Achievement info
  achievement_type: string;
  achievement_name: string;
  achievement_description: string | null;
  achievement_tier: AchievementTier | null;

  // Progress
  progress_current: number;
  progress_required: number;
  unlocked: boolean;
  unlocked_at: string | null;

  // Metadata
  created_at: string;
}

// =====================================================
// SAVED BILLS TYPES
// =====================================================

export interface SavedBill {
  id: string;
  user_id: string;
  bill_id: string;

  // Organization
  tags: string[];
  notes: string | null;

  // Metadata
  created_at: string;
}

// =====================================================
// REPRESENTATIVE TYPES
// =====================================================

export type RoleType = 'representative' | 'senator';

export interface Representative {
  id: string;

  // Info
  bioguide_id: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;

  // Role
  role_type: RoleType;
  party: string | null;
  state: string;
  district: string | null;

  // Contact
  office_address: string | null;
  phone: string | null;
  website_url: string | null;
  contact_form_url: string | null;
  twitter_handle: string | null;

  // Photo
  photo_url: string | null;

  // Status
  in_office: boolean;
  term_start: string | null;
  term_end: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
}

// =====================================================
// DATABASE TYPE
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: any;
        Update: any;
      };
      bills: {
        Row: Bill;
        Insert: any;
        Update: any;
      };
      news_articles: {
        Row: NewsArticle;
        Insert: any;
        Update: any;
      };
      bill_news: {
        Row: BillNewsRelation;
        Insert: any;
        Update: any;
      };
      letters: {
        Row: Letter;
        Insert: any;
        Update: any;
      };
      engagement_tracking: {
        Row: EngagementTracking;
        Insert: any;
        Update: any;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: any;
        Update: any;
      };
      saved_bills: {
        Row: SavedBill;
        Insert: any;
        Update: any;
      };
      representatives: {
        Row: Representative;
        Insert: any;
        Update: any;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
