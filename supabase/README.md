# Supabase Setup Guide

This guide will help you set up the Supabase database for Legislator Lens.

## Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js 18+ installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `legislator-lens`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your target audience
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project API")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

## Step 3: Configure Environment Variables

1. In your project root, create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Replace the placeholder values with your actual API keys

## Step 4: Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (bottom right)
7. Wait for the schema to be created (~10 seconds)

You should see a success message: "Success. No rows returned"

## Step 5: Verify the Setup

### Check Tables

1. Go to **Table Editor** in the left sidebar
2. You should see the following tables:
   - `users`
   - `bills`
   - `news_articles`
   - `bill_news`
   - `letters`
   - `engagement_tracking`
   - `user_achievements`
   - `saved_bills`
   - `representatives`

### Check Row Level Security (RLS)

1. Go to **Authentication** → **Policies**
2. Each table should have RLS policies configured
3. You should see policies like:
   - "Users can view own profile"
   - "Bills are viewable by everyone"
   - "Users can view own letters"
   - etc.

## Step 6: Optional - Add Sample Data

You can add sample data for testing:

### Sample Bill

```sql
INSERT INTO bills (
  bill_number,
  bill_type,
  congress,
  title,
  summary,
  status,
  introduced_date,
  sponsor_name,
  sponsor_party,
  sponsor_state
) VALUES (
  'hr-1-118',
  'hr',
  118,
  'Sample Healthcare Reform Act',
  'A bill to improve healthcare access for all Americans',
  'introduced',
  '2025-01-03',
  'Rep. Sample Person',
  'D',
  'CA'
);
```

### Sample Representative

```sql
INSERT INTO representatives (
  bioguide_id,
  full_name,
  first_name,
  last_name,
  role_type,
  party,
  state,
  district,
  in_office
) VALUES (
  'S000001',
  'Jane Smith',
  'Jane',
  'Smith',
  'representative',
  'D',
  'CA',
  '12',
  true
);
```

## Step 7: Test the Connection

Run your Next.js development server:

```bash
npm run dev
```

The application should start without any Supabase connection errors.

## Database Schema Overview

### Core Tables

1. **users**: User profiles linked to Clerk authentication
   - Stores preferences, civic scores, location data
   - RLS: Users can only access their own profile

2. **bills**: Congressional legislation with AI analysis cache
   - Stores Congress.gov data and AI-generated summaries
   - RLS: Public read access, no user writes

3. **news_articles**: Related news coverage
   - Articles from NewsAPI and Guardian API
   - RLS: Public read access

4. **letters**: User correspondence with representatives
   - Tracks letters written using AI assistance
   - RLS: Users can only access their own letters

5. **engagement_tracking**: User activity and points
   - Tracks all user interactions for gamification
   - RLS: Users can only access their own engagement

6. **saved_bills**: User's bookmarked bills
   - Many-to-many relationship between users and bills
   - RLS: Users can only access their own saved bills

7. **representatives**: Current elected officials
   - Used for letter recipient matching
   - RLS: Public read access

8. **user_achievements**: Gamification badges and milestones
   - Tracks progress toward achievements
   - RLS: Users can only access their own achievements

9. **bill_news**: Junction table linking bills to news articles
   - Many-to-many relationship with relevance scores
   - RLS: Public read access

## Database Features

### Indexes

The schema includes optimized indexes for:
- Fast bill searches by number, status, date
- Efficient category filtering using GIN indexes
- Quick user lookups by Clerk ID
- Representative matching by state/district

### Triggers

Automated triggers handle:
- `updated_at` timestamp updates
- Civic score calculation from engagement points

### Functions

Custom PostgreSQL functions for:
- Updating `updated_at` columns
- Calculating civic scores from engagement

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to access only their own data (users, letters, etc.)
- Provide public read access to bills and news
- Prevent unauthorized data modification

### API Keys

- **Anon Key**: Safe to use in client-side code, respects RLS policies
- **Service Role Key**: Bypasses RLS, use only in secure server contexts

## Troubleshooting

### Connection Errors

If you see connection errors:
1. Check that environment variables are set correctly
2. Verify API keys from Supabase dashboard
3. Ensure `.env.local` is in the project root
4. Restart the development server

### RLS Policy Errors

If queries fail with permission errors:
1. Check that RLS policies are created correctly
2. Verify user authentication is working
3. Use the service role key for admin operations

### Schema Errors

If the schema fails to run:
1. Check for existing tables (drop them if needed)
2. Ensure you copied the entire schema file
3. Run sections one at a time to isolate errors

## Next Steps

After setting up Supabase:
1. Configure Clerk authentication (see `docs/GETTING_STARTED.md`)
2. Set up Congress.gov API integration
3. Implement Chrome AI API features
4. Start building the UI components

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
