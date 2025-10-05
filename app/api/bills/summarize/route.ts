// Bill Summarization API Endpoint
// Generates AI summaries for bills using Chrome's Summarizer API

import { NextRequest, NextResponse } from 'next/server';
import { generateBillSummaries, generateSingleBillSummary } from '@/lib/services/bill-summary';
import type { SummaryType } from '@/lib/ai/summarizer';

export const runtime = 'edge'; // Use edge runtime for better performance

/**
 * POST /api/bills/summarize
 * Generate AI summaries for a bill
 *
 * Body:
 * - congress: Congress number
 * - billType: Bill type (hr, s, hjres, sjres)
 * - billNumber: Bill number
 * - summaryTypes?: Array of summary types (default: ['key-points', 'tl;dr'])
 * - summaryType?: Single summary type (alternative to summaryTypes)
 * - forceRefresh?: Force regeneration (skip cache)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { congress, billType, billNumber, summaryTypes, summaryType, forceRefresh = false } = body;

    // Validate required fields
    if (!congress || !billType || !billNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: congress, billType, billNumber' },
        { status: 400 }
      );
    }

    // Handle single summary type request
    if (summaryType) {
      const summary = await generateSingleBillSummary(
        congress,
        billType,
        billNumber,
        { type: summaryType as SummaryType }
      );

      return NextResponse.json({
        billId: `${billType.toLowerCase()}-${billNumber}-${congress}`,
        summary,
        fromCache: summary.cached || false,
      });
    }

    // Handle multiple summary types
    const result = await generateBillSummaries({
      congress,
      billType,
      billNumber,
      summaryTypes: summaryTypes || ['key-points', 'tl;dr'],
      forceRefresh,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating bill summaries:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to generate summaries';

    // Handle specific error cases
    if (errorMessage.includes('not available') || errorMessage.includes('not supported')) {
      return NextResponse.json(
        {
          error: errorMessage,
          suggestion: 'Please use Chrome Canary with built-in AI features enabled',
        },
        { status: 503 }
      );
    }

    if (errorMessage.includes('No bill text available')) {
      return NextResponse.json(
        {
          error: 'Bill text not yet available',
          suggestion: 'This bill may not have published text yet. Try again later.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bills/summarize
 * Check if Chrome Summarizer API is available
 */
export async function GET() {
  return NextResponse.json({
    message: 'Bill summarization endpoint',
    usage: 'POST request with { congress, billType, billNumber, summaryTypes }',
    availableSummaryTypes: ['key-points', 'tl;dr', 'teaser', 'headline'],
    availableLengths: ['short', 'medium', 'long'],
  });
}
