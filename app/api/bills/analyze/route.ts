// Hybrid AI Bill Analysis API Endpoint
// Intelligent routing between Chrome AI (on-device) and Cloud AI (Gemini, News APIs)

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

export const runtime = 'nodejs'; // Need Node runtime for server-side cloud AI calls

/**
 * POST /api/bills/analyze
 * Perform comprehensive bill analysis using hybrid AI
 *
 * Body:
 * - billId: Bill identifier (e.g., "hr-1234-118")
 * - billTitle: Bill title
 * - billSummary: Brief summary
 * - billText: Full bill text
 * - billIntroducedDate?: Bill introduction date
 * - analysisLevel?: 'quick' | 'standard' | 'deep' (default: 'standard')
 * - options?: HybridAnalysisOptions override
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      billId,
      billTitle,
      billSummary,
      billText,
      billIntroducedDate,
      analysisLevel = 'standard',
      options = {},
    } = body;

    // Validate required fields
    if (!billId || !billTitle || !billSummary || !billText) {
      return NextResponse.json(
        { error: 'Missing required fields: billId, billTitle, billSummary, billText' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check cache first
    const { data: cachedAnalysis } = await supabase
      .from('bill_analyses')
      .select('*')
      .eq('bill_id', billId)
      .eq('analysis_level', analysisLevel)
      .single();

    if (cachedAnalysis && !options.forceRefresh) {
      return NextResponse.json({
        ...cachedAnalysis.analysis_data,
        fromCache: true,
        cachedAt: cachedAnalysis.created_at,
      });
    }

    // Determine analysis options based on level
    const analysisOptions = getAnalysisOptions(analysisLevel, options);

    // Import hybrid router (dynamic to avoid client-side issues)
    const { analyzeBillWithHybridAI } = await import('@/lib/ai/hybrid-router');

    // Perform analysis
    const startTime = Date.now();
    const analysis = await analyzeBillWithHybridAI(
      billTitle,
      billSummary,
      billText,
      billIntroducedDate ? new Date(billIntroducedDate) : undefined,
      analysisOptions
    );

    const totalTime = Date.now() - startTime;

    // Cache the result
    await supabase.from('bill_analyses').upsert({
      bill_id: billId,
      analysis_level: analysisLevel,
      analysis_data: analysis,
      chrome_processing_time: analysis.processingTime.chrome,
      cloud_processing_time: analysis.processingTime.cloud,
      total_processing_time: totalTime,
      providers_used: analysis.providers,
    });

    return NextResponse.json({
      ...analysis,
      fromCache: false,
    });
  } catch (error) {
    console.error('Error analyzing bill:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze bill';

    // Handle specific error cases
    if (errorMessage.includes('Chrome AI') || errorMessage.includes('not available')) {
      return NextResponse.json(
        {
          error: errorMessage,
          suggestion: 'Chrome AI features require Chrome Canary with Early Preview enrollment',
          fallback: 'Try using analysisLevel: "cloud-only" if available',
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        {
          error: 'Cloud AI features not configured',
          suggestion: 'Add GEMINI_API_KEY and GUARDIAN_API_KEY to environment variables',
          availableFeatures: 'Chrome AI features only',
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/bills/analyze
 * Check hybrid AI availability
 */
export async function GET() {
  try {
    const { checkHybridAvailability } = await import('@/lib/ai/hybrid-router');
    const availability = await checkHybridAvailability();

    return NextResponse.json({
      message: 'Hybrid AI bill analysis endpoint',
      usage: 'POST request with { billId, billTitle, billSummary, billText, analysisLevel }',
      availableLevels: ['quick', 'standard', 'deep'],
      availability,
      levelDescriptions: {
        quick: 'Chrome AI only - Fast, private, offline-capable (summary, categories, provisions)',
        standard: 'Chrome AI + selective Cloud AI - Balanced performance and depth',
        deep: 'Chrome AI + full Cloud AI - Complete analysis with historical context and news',
      },
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Hybrid AI bill analysis endpoint',
      error: 'Unable to check availability',
    });
  }
}

/**
 * Helper: Get analysis options based on level
 */
function getAnalysisOptions(level: string, overrides: any) {
  const baseOptions = {
    includeSummary: true,
    includeCategories: true,
    includeProvisions: true,
    includeStakeholders: false,
    includeHistoricalAnalysis: false,
    includeImpactAnalysis: false,
    includeNews: false,
    offlineMode: false,
    ...overrides,
  };

  switch (level) {
    case 'quick':
      return {
        ...baseOptions,
        includeStakeholders: false,
        includeHistoricalAnalysis: false,
        includeImpactAnalysis: false,
        includeNews: false,
        offlineMode: true, // Force Chrome AI only
      };

    case 'standard':
      return {
        ...baseOptions,
        includeStakeholders: true,
        includeHistoricalAnalysis: false,
        includeImpactAnalysis: false,
        includeNews: false,
      };

    case 'deep':
      return {
        ...baseOptions,
        includeStakeholders: true,
        includeHistoricalAnalysis: true,
        includeImpactAnalysis: true,
        includeNews: true,
      };

    default:
      return baseOptions;
  }
}
