-- Legislator Lens Database Schema
-- Supabase PostgreSQL Schema for civic engagement platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
-- Extended user profiles linked to Clerk authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,

  -- User preferences
  preferred_categories TEXT[] DEFAULT '{}',
  engagement_level TEXT DEFAULT 'stay_informed' CHECK (engagement_level IN ('stay_informed', 'take_action', 'deep_analysis')),
  notification_preferences JSONB DEFAULT '{"email": true, "push": false, "frequency": "weekly"}',

  -- Location info for representative matching
  zip_code TEXT,
  state TEXT,
  district TEXT,

  -- Civic score and gamification
  civic_score INTEGER DEFAULT 0,
  knowledge_points INTEGER DEFAULT 0,
  action_points INTEGER DEFAULT 0,
  community_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Privacy settings
  privacy_settings JSONB DEFAULT '{"profile_visibility": "private", "share_metrics": false}',

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_state_district ON users(state, district);

-- =====================================================
-- BILLS TABLE
-- =====================================================
-- Congressional legislation with AI-generated analysis cache
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Congress.gov data
  bill_number TEXT UNIQUE NOT NULL,
  bill_type TEXT NOT NULL CHECK (bill_type IN ('hr', 's', 'hjres', 'sjres', 'hconres', 'sconres', 'hres', 'sres')),
  congress INTEGER NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT,
  official_title TEXT,

  -- Bill content
  summary TEXT,
  full_text TEXT,
  full_text_url TEXT,

  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'introduced',
  introduced_date DATE,
  latest_action_date DATE,
  latest_action_text TEXT,

  -- Sponsor info
  sponsor_name TEXT,
  sponsor_party TEXT,
  sponsor_state TEXT,
  sponsor_bioguide_id TEXT,

  -- Cosponsors
  cosponsors_count INTEGER DEFAULT 0,
  cosponsors JSONB DEFAULT '[]',

  -- Categories (AI-generated and traditional)
  ai_categories TEXT[] DEFAULT '{}',
  policy_areas TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',

  -- AI Analysis Cache (to avoid redundant processing)
  ai_summary_short TEXT,
  ai_summary_medium TEXT,
  ai_summary_long TEXT,
  ai_key_provisions JSONB DEFAULT '[]',
  ai_impact_analysis JSONB DEFAULT '{}',
  ai_stakeholder_perspectives JSONB DEFAULT '[]',
  ai_visual_prompts JSONB DEFAULT '[]',
  ai_processed_at TIMESTAMP WITH TIME ZONE,

  -- Engagement metrics
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  letters_count INTEGER DEFAULT 0,

  -- External data
  congress_gov_url TEXT,
  govtrack_url TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bills_bill_number ON bills(bill_number);
CREATE INDEX idx_bills_congress ON bills(congress);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_introduced_date ON bills(introduced_date DESC);
CREATE INDEX idx_bills_ai_categories ON bills USING GIN(ai_categories);
CREATE INDEX idx_bills_policy_areas ON bills USING GIN(policy_areas);
CREATE INDEX idx_bills_views_count ON bills(views_count DESC);

-- =====================================================
-- NEWS ARTICLES TABLE
-- =====================================================
-- Related news coverage from NewsAPI and Guardian API
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Article metadata
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  url TEXT UNIQUE NOT NULL,
  image_url TEXT,

  -- Source info
  source_name TEXT NOT NULL,
  source_api TEXT NOT NULL CHECK (source_api IN ('newsapi', 'guardian', 'manual')),
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- AI processing
  ai_summary TEXT,
  ai_relevance_score FLOAT CHECK (ai_relevance_score >= 0 AND ai_relevance_score <= 1),
  ai_key_themes TEXT[] DEFAULT '{}',
  ai_processed_at TIMESTAMP WITH TIME ZONE,

  -- Related bills (many-to-many via bill_news junction)

  -- Engagement
  views_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_url ON news_articles(url);
CREATE INDEX idx_news_published_at ON news_articles(published_at DESC);
CREATE INDEX idx_news_source_api ON news_articles(source_api);
CREATE INDEX idx_news_relevance_score ON news_articles(ai_relevance_score DESC NULLS LAST);

-- =====================================================
-- BILL_NEWS JUNCTION TABLE
-- =====================================================
-- Many-to-many relationship between bills and news articles
CREATE TABLE IF NOT EXISTS bill_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  news_article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(bill_id, news_article_id)
);

CREATE INDEX idx_bill_news_bill_id ON bill_news(bill_id);
CREATE INDEX idx_bill_news_article_id ON bill_news(news_article_id);
CREATE INDEX idx_bill_news_relevance ON bill_news(relevance_score DESC NULLS LAST);

-- =====================================================
-- LETTERS TABLE
-- =====================================================
-- User correspondence with representatives
CREATE TABLE IF NOT EXISTS letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,

  -- Letter content
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  position TEXT CHECK (position IN ('support', 'oppose', 'neutral')),

  -- Recipient info
  recipient_name TEXT NOT NULL,
  recipient_title TEXT,
  recipient_type TEXT CHECK (recipient_type IN ('representative', 'senator', 'local', 'other')),
  recipient_state TEXT,
  recipient_district TEXT,

  -- AI assistance tracking
  ai_assisted BOOLEAN DEFAULT FALSE,
  ai_input_mode TEXT[] DEFAULT '{}', -- ['text', 'voice', 'image']
  ai_tone TEXT, -- formal, casual, passionate
  ai_quality_score FLOAT CHECK (ai_quality_score >= 0 AND ai_quality_score <= 1),

  -- Delivery
  delivery_method TEXT CHECK (delivery_method IN ('platform', 'email', 'pdf', 'copy', 'social')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'draft' CHECK (delivery_status IN ('draft', 'sent', 'delivered', 'failed')),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_letters_user_id ON letters(user_id);
CREATE INDEX idx_letters_bill_id ON letters(bill_id);
CREATE INDEX idx_letters_delivery_status ON letters(delivery_status);
CREATE INDEX idx_letters_created_at ON letters(created_at DESC);

-- =====================================================
-- ENGAGEMENT TRACKING TABLE
-- =====================================================
-- Track user interactions for personalization and analytics
CREATE TABLE IF NOT EXISTS engagement_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Engagement type and target
  engagement_type TEXT NOT NULL CHECK (engagement_type IN (
    'bill_view', 'bill_save', 'bill_share', 'bill_read_time',
    'news_view', 'news_share',
    'letter_draft', 'letter_sent',
    'search', 'category_browse',
    'achievement_unlock', 'streak_milestone'
  )),

  -- Target references (nullable - depends on engagement type)
  bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  news_article_id UUID REFERENCES news_articles(id) ON DELETE SET NULL,
  letter_id UUID REFERENCES letters(id) ON DELETE SET NULL,

  -- Engagement data
  engagement_data JSONB DEFAULT '{}', -- flexible data for different engagement types

  -- Points awarded
  points_awarded INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_engagement_user_id ON engagement_tracking(user_id);
CREATE INDEX idx_engagement_type ON engagement_tracking(engagement_type);
CREATE INDEX idx_engagement_bill_id ON engagement_tracking(bill_id);
CREATE INDEX idx_engagement_created_at ON engagement_tracking(created_at DESC);

-- =====================================================
-- USER ACHIEVEMENTS TABLE
-- =====================================================
-- Gamification achievements and badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Achievement info
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_tier TEXT CHECK (achievement_tier IN ('bronze', 'silver', 'gold', 'platinum')),

  -- Progress
  progress_current INTEGER DEFAULT 0,
  progress_required INTEGER NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, achievement_type, achievement_name)
);

CREATE INDEX idx_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON user_achievements(unlocked);

-- =====================================================
-- SAVED BILLS TABLE
-- =====================================================
-- User's saved/bookmarked bills
CREATE TABLE IF NOT EXISTS saved_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, bill_id)
);

CREATE INDEX idx_saved_bills_user_id ON saved_bills(user_id);
CREATE INDEX idx_saved_bills_bill_id ON saved_bills(bill_id);

-- =====================================================
-- REPRESENTATIVES TABLE
-- =====================================================
-- Current representatives info for letter matching
CREATE TABLE IF NOT EXISTS representatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Representative info
  bioguide_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,

  -- Role
  role_type TEXT NOT NULL CHECK (role_type IN ('representative', 'senator')),
  party TEXT,
  state TEXT NOT NULL,
  district TEXT, -- NULL for senators

  -- Contact info
  office_address TEXT,
  phone TEXT,
  website_url TEXT,
  contact_form_url TEXT,
  twitter_handle TEXT,

  -- Photo
  photo_url TEXT,

  -- Status
  in_office BOOLEAN DEFAULT TRUE,
  term_start DATE,
  term_end DATE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_representatives_bioguide ON representatives(bioguide_id);
CREATE INDEX idx_representatives_state_district ON representatives(state, district);
CREATE INDEX idx_representatives_in_office ON representatives(in_office);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;

-- Users: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_id);

-- Bills: Public read access, no user writes
CREATE POLICY "Bills are viewable by everyone" ON bills
  FOR SELECT USING (true);

-- News Articles: Public read access
CREATE POLICY "News articles are viewable by everyone" ON news_articles
  FOR SELECT USING (true);

-- Bill News: Public read access
CREATE POLICY "Bill news relations are viewable by everyone" ON bill_news
  FOR SELECT USING (true);

-- Letters: Users can only access their own letters
CREATE POLICY "Users can view own letters" ON letters
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own letters" ON letters
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own letters" ON letters
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can delete own letters" ON letters
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Engagement Tracking: Users can only access their own engagement
CREATE POLICY "Users can view own engagement" ON engagement_tracking
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own engagement" ON engagement_tracking
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- User Achievements: Users can only view their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update own achievements" ON user_achievements
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Saved Bills: Users can only access their own saved bills
CREATE POLICY "Users can view own saved bills" ON saved_bills
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own saved bills" ON saved_bills
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can delete own saved bills" ON saved_bills
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- Representatives: Public read access
CREATE POLICY "Representatives are viewable by everyone" ON representatives
  FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_representatives_updated_at BEFORE UPDATE ON representatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user civic score
CREATE OR REPLACE FUNCTION update_user_civic_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET
    civic_score = knowledge_points + action_points + community_points,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update civic score when engagement is tracked
CREATE TRIGGER update_civic_score_on_engagement AFTER INSERT ON engagement_tracking
  FOR EACH ROW EXECUTE FUNCTION update_user_civic_score();
