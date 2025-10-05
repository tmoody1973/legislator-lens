// Single Member API Route Handler
// Provides detailed member information

import { NextRequest, NextResponse } from 'next/server';
import { getMember } from '@/lib/api/congress';

interface RouteParams {
  params: Promise<{
    bioguideId: string;
  }>;
}

/**
 * GET /api/members/[bioguideId]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { bioguideId } = await params;
    const member = await getMember(bioguideId);

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Error fetching member details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    );
  }
}
