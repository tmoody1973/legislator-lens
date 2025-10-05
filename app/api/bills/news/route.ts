// News Correlation API Endpoint
// Correlates bills with current events using NewsAPI and Guardian API

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/bills/news
 * Find news articles related to a bill
 *
 * Body:
 * - billId: Bill identifier
 * - billTitle: Bill title
 * - billSummary: Brief summary
 * - keywords: Array of search keywords (from categories)
 * - billIntroducedDate?: Bill introduction date
 * - forceRefresh?: Skip cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, billTitle, billSummary, keywords, billIntroducedDate, forceRefresh = false } =
      body;

    // Validate required fields
    if (!billId || !billTitle || !billSummary || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        {
          error: 'Missing required fields: billId, billTitle, billSummary, keywords (array)',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check cache
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('bill_news_correlations')
        .select('*')
        .eq('bill_id', billId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return NextResponse.json({
          ...cached.correlation_data,
          fromCache: true,
          cachedAt: cached.created_at,
        });
      }
    }

    // Check if news APIs are configured
    const hasGuardian = !!process.env.GUARDIAN_API_KEY;
    const hasNewsAPI = !!process.env.NEWS_API_KEY;
    const hasSerpAPI = !!process.env.SERPAPI_API_KEY;

    if (!hasGuardian && !hasNewsAPI && !hasSerpAPI) {
      return NextResponse.json(
        {
          error: 'News APIs not configured',
          suggestion: 'Add GUARDIAN_API_KEY, NEWS_API_KEY, or SERPAPI_API_KEY to environment variables',
        },
        { status: 503 }
      );
    }

    // Import news functions
    const { correlateBillWithNews } = await import('@/lib/cloud-ai/news');

    // Perform correlation
    const startTime = Date.now();
    const correlation = await correlateBillWithNews(
      billTitle,
      billSummary,
      keywords,
      billIntroducedDate ? new Date(billIntroducedDate) : undefined
    );
    const processingTime = Date.now() - startTime;

    // Cache the result
    await supabase.from('bill_news_correlations').insert({
      bill_id: billId,
      correlation_data: correlation,
      processing_time: processingTime,
    });

    return NextResponse.json({
      ...correlation,
      fromCache: false,
      processingTime,
      sources: {
        guardian: hasGuardian,
        newsapi: hasNewsAPI,
        serpapi: hasSerpAPI,
      },
    });
  } catch (error) {
    console.error('Error correlating bill with news:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to correlate with news';

    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        {
          error: 'News API authentication failed',
          suggestion: 'Check that GUARDIAN_API_KEY or NEWS_API_KEY is valid',
        },
        { status: 401 }
      );
    }

    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'API quota exceeded',
          suggestion: 'Please try again later',
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/bills/news
 * Check news correlation availability
 */
export async function GET() {
  const guardianConfigured = !!process.env.GUARDIAN_API_KEY;
  const newsapiConfigured = !!process.env.NEWS_API_KEY;
  const serpapiConfigured = !!process.env.SERPAPI_API_KEY;

  return NextResponse.json({
    message: 'Bill news correlation endpoint',
    usage: 'POST request with { billId, billTitle, billSummary, keywords, billIntroducedDate }',
    available: guardianConfigured || newsapiConfigured || serpapiConfigured,
    providers: {
      guardian: guardianConfigured,
      newsapi: newsapiConfigured,
      serpapi: serpapiConfigured,
    },
    features: [
      'Find related news articles from multiple sources',
      'Combine Guardian, NewsAPI, and SerpAPI (Google News)',
      'Create news timeline',
      'Analyze sentiment',
      'Group articles by time period',
      'Deduplicate cross-source articles',
      'Smart source prioritization',
    ],
  });
}
