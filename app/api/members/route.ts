// Members API Route Handler
// Provides endpoints for fetching Congress members

import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentMembers,
  getMembersByState,
  getCurrentCongress,
} from '@/lib/api/congress';

/**
 * GET /api/members
 * Query params:
 * - congress: Congress number (default: current)
 * - chamber: house | senate (optional)
 * - state: Two-letter state code (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const congress = parseInt(searchParams.get('congress') || String(getCurrentCongress()));
    const chamber = searchParams.get('chamber') as 'house' | 'senate' | undefined;
    const state = searchParams.get('state') || undefined;

    // If state param exists, filter by state
    if (state) {
      const members = await getMembersByState(state, congress);
      return NextResponse.json({ members });
    }

    // Otherwise, get all members (optionally filtered by chamber)
    const members = await getCurrentMembers(congress, chamber);
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
