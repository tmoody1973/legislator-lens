import { NextRequest, NextResponse } from 'next/server';
import { generateMultipleBillSummariesWithGemini } from '@/lib/cloud-ai/gemini';

interface RouteContext {
  params: Promise<{
    congress: string;
    billType: string;
    billNumber: string;
  }>;
}

/**
 * GET /api/bills/[congress]/[billType]/[billNumber]/summarize-cloud
 * Generate bill summaries using cloud AI (Gemini) as fallback
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { congress, billType, billNumber } = params;

    // Get summary types from query params
    const { searchParams } = new URL(request.url);
    const typesParam = searchParams.get('types');
    const summaryTypes = typesParam
      ? typesParam.split(',') as Array<'key-points' | 'tl;dr' | 'teaser' | 'headline'>
      : ['key-points', 'tl;dr'];

    // Fetch bill text from our existing endpoint
    const billTextResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bills/${congress}/${billType}/${billNumber}/text`
    );

    if (!billTextResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch bill text' },
        { status: billTextResponse.status }
      );
    }

    const { text: billText } = await billTextResponse.json();

    if (!billText || billText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bill text is empty or not available yet' },
        { status: 404 }
      );
    }

    // Generate summaries using Gemini
    const summaries = await generateMultipleBillSummariesWithGemini(billText, summaryTypes);

    return NextResponse.json({
      summaries,
      source: 'gemini',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating cloud AI summaries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
