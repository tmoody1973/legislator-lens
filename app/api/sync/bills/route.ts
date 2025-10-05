// Bill Sync API Route Handler
// Triggers bill synchronization from Congress.gov to Supabase

import { NextRequest, NextResponse } from 'next/server';
import { syncRecentBills, getBillSyncStats, syncSpecificBill } from '@/lib/services/bill-sync';
import { getCurrentCongress } from '@/lib/api/congress';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/sync/bills
 * Triggers bill sync (requires authentication)
 * Body:
 * - congress: Congress number (default: current)
 * - limit: Number of bills per type (default: 100)
 * - billTypes: Array of bill types (default: ['hr', 's', 'hjres', 'sjres'])
 * - onlyWithFullText: true/false - Only sync bills with full text (default: false)
 * - specificBill: { congress, billType, billNumber } - sync specific bill
 */
export async function POST(request: NextRequest) {
  try {
    // Only authenticated users can trigger sync
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      congress = getCurrentCongress(),
      limit = 100,
      billTypes = ['hr', 's', 'hjres', 'sjres'],
      onlyWithFullText = false,
      specificBill,
    } = body;

    // If specific bill requested, sync that bill
    if (specificBill) {
      const { congress: billCongress, billType, billNumber } = specificBill;
      const result = await syncSpecificBill(billCongress, billType, billNumber);
      return NextResponse.json(result);
    }

    // Otherwise, sync recent bills
    const result = await syncRecentBills(congress, { limit, billTypes, onlyWithFullText });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in bill sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync bills' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/bills
 * Returns bill sync statistics
 */
export async function GET() {
  try {
    const stats = await getBillSyncStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return NextResponse.json(
      { error: 'Failed to get sync stats' },
      { status: 500 }
    );
  }
}
