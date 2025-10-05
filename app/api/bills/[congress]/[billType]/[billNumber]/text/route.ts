import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    congress: string;
    billType: string;
    billNumber: string;
  }>;
}

/**
 * GET /api/bills/[congress]/[billType]/[billNumber]/text
 * Fetch bill text from Congress.gov API
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { congress, billType, billNumber } = params;

    const apiKey = process.env.CONGRESS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Congress API key not configured' },
        { status: 500 }
      );
    }

    // Fetch bill data to get text versions
    const billResponse = await fetch(
      `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}?api_key=${apiKey}`
    );

    if (!billResponse.ok) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    const billData = await billResponse.json();
    const bill = billData.bill;

    // Get the latest text version URL
    if (!bill.textVersions || !bill.textVersions.url) {
      return NextResponse.json(
        { error: 'Bill text not available yet' },
        { status: 404 }
      );
    }

    // Fetch text versions list
    const textVersionsResponse = await fetch(`${bill.textVersions.url}&api_key=${apiKey}`);

    if (!textVersionsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch text versions' },
        { status: 500 }
      );
    }

    const textVersionsData = await textVersionsResponse.json();
    const textVersions = textVersionsData.textVersions;

    if (!textVersions || textVersions.length === 0) {
      return NextResponse.json(
        { error: 'No text versions available' },
        { status: 404 }
      );
    }

    // Get the first (latest) text version
    const latestVersion = textVersions[0];

    // Fetch the actual text
    // Note: congress.gov URLs don't need API key - only api.congress.gov does
    const textResponse = await fetch(latestVersion.formats[0].url);

    if (!textResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch bill text' },
        { status: 500 }
      );
    }

    const textData = await textResponse.text();

    return NextResponse.json({
      text: textData,
      version: latestVersion.type,
      date: latestVersion.date,
    });
  } catch (error) {
    console.error('Error fetching bill text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
