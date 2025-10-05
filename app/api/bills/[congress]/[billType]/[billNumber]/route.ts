// Single Bill API Route Handler
// Provides detailed bill information

import { NextRequest, NextResponse } from 'next/server';
import {
  getBill,
  getBillSummaries,
  getBillActions,
  getBillCosponsors,
  getBillText,
} from '@/lib/api/congress';

interface RouteParams {
  params: Promise<{
    congress: string;
    billType: string;
    billNumber: string;
  }>;
}

/**
 * GET /api/bills/[congress]/[billType]/[billNumber]
 * Query params:
 * - include: Comma-separated list of data to include (summaries, actions, cosponsors, text)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { congress, billType, billNumber } = await params;
    const congressNum = parseInt(congress);
    const billNum = parseInt(billNumber);
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include')?.split(',') || [];

    // Get base bill data
    const bill = await getBill(congressNum, billType, billNum);

    // Conditionally fetch additional data based on include param
    const [summaries, actions, cosponsors, textVersions] = await Promise.all([
      include.includes('summaries') ? getBillSummaries(congressNum, billType, billNum) : null,
      include.includes('actions') ? getBillActions(congressNum, billType, billNum) : null,
      include.includes('cosponsors') ? getBillCosponsors(congressNum, billType, billNum) : null,
      include.includes('text') ? getBillText(congressNum, billType, billNum) : null,
    ]);

    return NextResponse.json({
      bill,
      summaries,
      actions,
      cosponsors,
      textVersions,
    });
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill details' },
      { status: 500 }
    );
  }
}
