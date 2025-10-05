// Historical Bill Analysis API Endpoint
// Uses Google Gemini AI to find and analyze similar bills from congressional history

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/bills/historical
 * Analyze historical bills similar to the current one
 *
 * Body:
 * - billId: Bill identifier
 * - billTitle: Bill title
 * - billSummary: Brief summary
 * - provisions: Array of provision descriptions
 * - forceRefresh?: Skip cache
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, billTitle, billSummary, provisions, forceRefresh = false } = body;

    // Validate required fields
    if (!billId || !billTitle || !billSummary || !provisions || !Array.isArray(provisions)) {
      return NextResponse.json(
        {
          error: 'Missing required fields: billId, billTitle, billSummary, provisions (array)',
        },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check cache
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('bill_historical_analyses')
        .select('*')
        .eq('bill_id', billId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        return NextResponse.json({
          ...cached.analysis_data,
          fromCache: true,
          cachedAt: cached.created_at,
        });
      }
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: 'Gemini API not configured',
          suggestion: 'Add GEMINI_API_KEY to environment variables to use historical analysis',
        },
        { status: 503 }
      );
    }

    // Import Gemini functions
    const { analyzeHistoricalBills } = await import('@/lib/cloud-ai/gemini');

    // Perform analysis
    const startTime = Date.now();
    const analysis = await analyzeHistoricalBills(billTitle, billSummary, provisions);
    const processingTime = Date.now() - startTime;

    // Cache the result
    await supabase.from('bill_historical_analyses').insert({
      bill_id: billId,
      analysis_data: analysis,
      processing_time: processingTime,
    });

    return NextResponse.json({
      ...analysis,
      fromCache: false,
      processingTime,
    });
  } catch (error) {
    console.error('Error analyzing historical bills:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze historical bills';

    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
      return NextResponse.json(
        {
          error: 'Gemini API authentication failed',
          suggestion: 'Check that GEMINI_API_KEY is valid',
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
 * GET /api/bills/historical
 * Check historical analysis availability
 */
export async function GET() {
  const geminiConfigured = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    message: 'Historical bill analysis endpoint',
    usage: 'POST request with { billId, billTitle, billSummary, provisions }',
    available: geminiConfigured,
    provider: 'Google Gemini API',
    features: [
      'Find similar bills from past 10-15 years',
      'Compare outcomes and trends',
      'Identify key differences',
      'Provide historical context',
      'Generate recommendations based on history',
    ],
  });
}
