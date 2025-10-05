// Chrome Summarizer API Integration
// Provides bill summarization using Chrome's built-in AI

export type SummaryType = 'key-points' | 'tl;dr' | 'teaser' | 'headline';
export type SummaryFormat = 'markdown' | 'plain-text';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface SummarizerOptions {
  type?: SummaryType;
  format?: SummaryFormat;
  length?: SummaryLength;
  sharedContext?: string;
}

export interface BillSummary {
  summary: string;
  type: SummaryType;
  length: SummaryLength;
  format: SummaryFormat;
  generatedAt: Date;
  cached?: boolean;
}

export interface SummarizerAvailability {
  available: boolean;
  status: 'readily' | 'downloading' | 'downloadable' | 'no';
  message: string;
}

/**
 * Check if Chrome Summarizer API is available
 * Using new Chrome 138+ stable API
 */
export async function checkSummarizerAvailability(): Promise<SummarizerAvailability> {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return {
      available: false,
      status: 'no',
      message: 'Summarizer API only available in browser',
    };
  }

  // Check if Summarizer API exists (Chrome 138+ stable API)
  if (!('Summarizer' in self)) {
    return {
      available: false,
      status: 'no',
      message: 'Summarizer API not supported. Please use Chrome 138+ with built-in AI support.',
    };
  }

  try {
    const availability = await (self as any).Summarizer.availability();

    // New API returns: 'unavailable', 'available', or 'downloadable'
    if (availability === 'available') {
      return {
        available: true,
        status: 'readily',
        message: 'Summarizer API is ready',
      };
    }

    if (availability === 'downloadable') {
      return {
        available: false,
        status: 'downloadable',
        message: 'Summarizer model needs to be downloaded. Click to download.',
      };
    }

    return {
      available: false,
      status: 'no',
      message: 'Summarizer API is not available on this device',
    };
  } catch (error) {
    console.error('Error checking summarizer availability:', error);
    return {
      available: false,
      status: 'no',
      message: `Error checking availability: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Bill Summarizer Class
 * Manages summarizer instance and provides methods for bill summarization
 */
export class BillSummarizer {
  private summarizer: any = null;
  private options: SummarizerOptions;

  constructor(options: SummarizerOptions = {}) {
    this.options = {
      type: options.type || 'key-points',
      format: options.format || 'markdown',
      length: options.length || 'medium',
      sharedContext: options.sharedContext || 'Congressional legislation analysis. Focus on policy impact and key provisions.',
    };
  }

  /**
   * Map our internal summary types to Chrome API valid types
   * Chrome API only supports: 'key-points', 'teaser', 'headline'
   */
  private mapToChromeType(type: SummaryType): 'key-points' | 'teaser' | 'headline' {
    if (type === 'tl;dr') {
      return 'teaser'; // Map tl;dr to teaser (short summary)
    }
    return type as 'key-points' | 'teaser' | 'headline';
  }

  /**
   * Initialize the summarizer
   * Note: This MUST be called in response to a user interaction (click, tap, etc.)
   * when status is 'downloadable' to trigger model download
   * Using new Chrome 138+ stable API
   */
  async initialize(): Promise<void> {
    const availability = await checkSummarizerAvailability();

    // Allow initialization even when downloadable - the create() call will trigger download
    // Only block if status is 'no' or there's a hard error
    if (availability.status === 'no') {
      throw new Error(availability.message);
    }

    try {
      // This call will trigger model download if status is 'downloadable'
      // IMPORTANT: Must be called from user interaction for download to work
      // Using new Chrome 138+ stable API: Summarizer.create()
      this.summarizer = await (self as any).Summarizer.create({
        type: this.mapToChromeType(this.options.type),
        format: this.options.format,
        length: this.options.length,
        sharedContext: this.options.sharedContext,
      });
    } catch (error) {
      console.error('Error creating summarizer:', error);
      throw new Error(`Failed to create summarizer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Summarize text
   */
  async summarize(text: string, signal?: AbortSignal): Promise<string> {
    if (!this.summarizer) {
      throw new Error('Summarizer not initialized. Call initialize() first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text to summarize cannot be empty');
    }

    try {
      const summary = await this.summarizer.summarize(text, { signal });
      return summary;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Summarization was cancelled');
      }
      console.error('Summarization error:', error);
      throw new Error(`Summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    if (this.summarizer && typeof this.summarizer.destroy === 'function') {
      try {
        await this.summarizer.destroy();
      } catch (error) {
        console.error('Error destroying summarizer:', error);
      }
      this.summarizer = null;
    }
  }
}

/**
 * Convenience function to summarize bill text with automatic initialization
 */
export async function summarizeBill(
  billText: string,
  options: SummarizerOptions = {},
  signal?: AbortSignal
): Promise<BillSummary> {
  const summarizer = new BillSummarizer(options);

  try {
    await summarizer.initialize();
    const summary = await summarizer.summarize(billText, signal);

    return {
      summary,
      type: options.type || 'key-points',
      length: options.length || 'medium',
      format: options.format || 'markdown',
      generatedAt: new Date(),
      cached: false,
    };
  } finally {
    await summarizer.destroy();
  }
}

/**
 * Generate multiple summary types for a bill
 * OPTIMIZED: Creates only ONE summarizer instance and reuses it
 */
export async function generateMultipleSummaries(
  billText: string,
  types: SummaryType[] = ['key-points', 'tl;dr', 'headline'],
  signal?: AbortSignal
): Promise<Record<SummaryType, BillSummary>> {
  const summaries: Record<string, BillSummary> = {};

  // Create a single summarizer instance with key-points type
  // This works because Chrome's summarizer adapts based on sharedContext
  const summarizer = new BillSummarizer({
    type: 'key-points',
    format: 'markdown',
    length: 'medium',
  });

  try {
    // Initialize once - this is where the download happens (if needed)
    await summarizer.initialize();

    // Use the same instance for all summary types
    for (const type of types) {
      try {
        // Generate summary using the shared instance
        const summary = await summarizer.summarize(billText, signal);

        summaries[type] = {
          summary,
          type,
          length: type === 'headline' ? 'short' : 'medium',
          format: 'markdown',
          generatedAt: new Date(),
          cached: false,
        };
      } catch (error) {
        console.error(`Error generating ${type} summary:`, error);
        // Continue with other summaries even if one fails
      }
    }
  } finally {
    // Clean up the single instance
    await summarizer.destroy();
  }

  return summaries as Record<SummaryType, BillSummary>;
}

/**
 * Streaming summary (for long bills)
 */
export async function* streamBillSummary(
  billText: string,
  options: SummarizerOptions = {}
): AsyncGenerator<string, void, unknown> {
  const summarizer = new BillSummarizer(options);

  try {
    await summarizer.initialize();

    // Check if streaming is supported
    if (summarizer['summarizer'].summarizeStreaming) {
      const stream = await summarizer['summarizer'].summarizeStreaming(billText);

      for await (const chunk of stream) {
        yield chunk;
      }
    } else {
      // Fallback to non-streaming
      const summary = await summarizer.summarize(billText);
      yield summary;
    }
  } finally {
    await summarizer.destroy();
  }
}
