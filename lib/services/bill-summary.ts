// Bill Summary Service
// Coordinates bill text fetching, summarization, and caching

import { getBillText } from '@/lib/api/congress';
import {
  summarizeBill,
  generateMultipleSummaries,
  checkSummarizerAvailability,
  type BillSummary,
  type SummaryType,
  type SummarizerOptions,
} from '@/lib/ai/summarizer';
import { supabase } from '@/lib/db/supabase';

export interface BillSummaryRequest {
  congress: number;
  billType: string;
  billNumber: number;
  summaryTypes?: SummaryType[];
  forceRefresh?: boolean;
}

export interface BillSummaryResponse {
  billId: string;
  summaries: Record<SummaryType, BillSummary>;
  textVersion: string;
  generatedAt: Date;
  fromCache: boolean;
}

/**
 * Get bill text from Congress.gov API
 */
async function fetchBillFullText(
  congress: number,
  billType: string,
  billNumber: number
): Promise<{ text: string; version: string }> {
  try {
    const textVersions = await getBillText(congress, billType, billNumber);

    if (textVersions.length === 0) {
      throw new Error('No bill text available');
    }

    // Get the most recent text version
    const latestVersion = textVersions[0];

    // Find the text format (prefer formatted text, then XML, then PDF)
    const textFormat = latestVersion.formats.find(
      (f) => f.type === 'Formatted Text' || f.type === 'XML' || f.type === 'PDF'
    );

    if (!textFormat) {
      throw new Error('No readable text format available');
    }

    // Fetch the actual bill text
    const response = await fetch(textFormat.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch bill text: ${response.statusText}`);
    }

    const billText = await response.text();

    return {
      text: billText,
      version: latestVersion.type,
    };
  } catch (error) {
    console.error('Error fetching bill text:', error);
    throw error;
  }
}

/**
 * Get cached summary from database
 */
async function getCachedSummary(
  billId: string,
  summaryType: SummaryType
): Promise<BillSummary | null> {
  try {

    const { data, error } = await supabase
      .from('bill_summaries')
      .select('*')
      .eq('bill_id', billId)
      .eq('summary_type', summaryType)
      .single();

    if (error || !data) {
      return null;
    }

    // Type assertion needed until bill_summaries is added to Database type
    const summaryData = data as any;
    return {
      summary: summaryData.summary_text,
      type: summaryType,
      length: summaryData.summary_length,
      format: summaryData.summary_format,
      generatedAt: new Date(summaryData.created_at),
      cached: true,
    };
  } catch (error) {
    console.error('Error fetching cached summary:', error);
    return null;
  }
}

/**
 * Save summary to database cache
 */
async function cacheSummary(
  billId: string,
  summaryType: SummaryType,
  summary: BillSummary
): Promise<void> {
  try {

    await supabase.from('bill_summaries').upsert({
      bill_id: billId,
      summary_type: summaryType,
      summary_text: summary.summary,
      summary_length: summary.length,
      summary_format: summary.format,
      generated_at: summary.generatedAt.toISOString(),
    } as any);
  } catch (error) {
    console.error('Error caching summary:', error);
    // Don't throw - caching is not critical
  }
}

/**
 * Generate summaries for a bill
 */
export async function generateBillSummaries(
  request: BillSummaryRequest,
  signal?: AbortSignal
): Promise<BillSummaryResponse> {
  const { congress, billType, billNumber, summaryTypes = ['key-points', 'tl;dr'], forceRefresh = false } = request;

  const billId = `${billType.toLowerCase()}-${billNumber}-${congress}`;

  // Check if summarizer is available
  const availability = await checkSummarizerAvailability();
  if (!availability.available) {
    throw new Error(availability.message);
  }

  // Try to get from cache first
  if (!forceRefresh) {
    const cachedSummaries: Record<string, BillSummary> = {};
    let allCached = true;

    for (const type of summaryTypes) {
      const cached = await getCachedSummary(billId, type);
      if (cached) {
        cachedSummaries[type] = cached;
      } else {
        allCached = false;
        break;
      }
    }

    if (allCached && Object.keys(cachedSummaries).length === summaryTypes.length) {
      return {
        billId,
        summaries: cachedSummaries as Record<SummaryType, BillSummary>,
        textVersion: 'cached',
        generatedAt: new Date(),
        fromCache: true,
      };
    }
  }

  // Fetch bill text
  const { text: billText, version: textVersion } = await fetchBillFullText(congress, billType, billNumber);

  // Generate summaries
  const summaries = await generateMultipleSummaries(billText, summaryTypes, signal);

  // Cache the summaries
  for (const [type, summary] of Object.entries(summaries)) {
    await cacheSummary(billId, type as SummaryType, summary);
  }

  return {
    billId,
    summaries,
    textVersion,
    generatedAt: new Date(),
    fromCache: false,
  };
}

/**
 * Generate single summary type for a bill
 */
export async function generateSingleBillSummary(
  congress: number,
  billType: string,
  billNumber: number,
  options: SummarizerOptions = {},
  signal?: AbortSignal
): Promise<BillSummary> {
  const billId = `${billType.toLowerCase()}-${billNumber}-${congress}`;
  const summaryType = options.type || 'key-points';

  // Check cache first
  const cached = await getCachedSummary(billId, summaryType);
  if (cached) {
    return cached;
  }

  // Fetch bill text
  const { text: billText } = await fetchBillFullText(congress, billType, billNumber);

  // Generate summary
  const summary = await summarizeBill(billText, options, signal);

  // Cache the summary
  await cacheSummary(billId, summaryType, summary);

  return summary;
}

/**
 * Clear cached summaries for a bill
 */
export async function clearBillSummaryCache(billId: string): Promise<void> {
  try {

    await supabase.from('bill_summaries').delete().eq('bill_id', billId);
  } catch (error) {
    console.error('Error clearing summary cache:', error);
    throw error;
  }
}
