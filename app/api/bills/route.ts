// Bills API Route Handler
// Provides endpoints for fetching bills from Congress.gov

import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentBills,
  searchBills,
  getCurrentCongress,
} from '@/lib/api/congress';

/**
 * GET /api/bills
 * Query params:
 * - congress: Congress number (default: current)
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 * - billType: Filter by bill type (hr, s, hjres, sjres, etc.)
 * - query: Search query for bill search
 * - onlyWithFullText: true/false - Only return bills with full text available
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const congress = parseInt(searchParams.get('congress') || String(getCurrentCongress()));
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const billType = searchParams.get('billType') || undefined;
    const onlyWithFullText = searchParams.get('onlyWithFullText') === 'true';

    // If query param exists, use search endpoint
    if (query) {
      const results = await searchBills(query, { congress, limit, offset });
      return NextResponse.json(results);
    }

    // Otherwise, get recent bills
    const results = await getRecentBills(congress, { limit, offset, billType, onlyWithFullText });
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}
