// Chrome Proofreader API Integration
// Provides grammar and spelling corrections for letter quality assurance

export interface ProofreaderAvailability {
  available: boolean;
  status: 'readily' | 'downloading' | 'downloadable' | 'no';
  message: string;
}

export interface ProofreaderOptions {
  expectedInputLanguages?: string[]; // e.g., ['en', 'es']
}

export interface Correction {
  startIndex: number;
  endIndex: number;
  original: string;
  suggestion: string;
  type?: 'spelling' | 'grammar' | 'punctuation' | 'other';
}

export interface ProofreadResult {
  corrected: string;
  corrections: Correction[];
  originalText: string;
  correctionCount: number;
  hasErrors: boolean;
}

/**
 * Check if Chrome Proofreader API is available
 */
export async function checkProofreaderAvailability(): Promise<ProofreaderAvailability> {
  try {
    if (!('ai' in window) || !('proofreader' in (window as any).ai)) {
      return {
        available: false,
        status: 'no',
        message: 'Proofreader API not supported in this browser. Please use Chrome Canary with AI flags enabled.',
      };
    }

    const ai = (window as any).ai;
    const capabilities = await ai.proofreader.capabilities();

    if (!capabilities || capabilities.available === 'no') {
      return {
        available: false,
        status: 'no',
        message: 'Proofreader API not available on this device.',
      };
    }

    const status = capabilities.available;

    return {
      available: status === 'readily',
      status,
      message: status === 'readily'
        ? 'Proofreader API is ready to use'
        : status === 'downloading'
        ? 'AI model is downloading... Please wait.'
        : status === 'downloadable'
        ? 'AI model needs to be downloaded. This may require user interaction.'
        : 'Proofreader API is not available.',
    };
  } catch (error) {
    console.error('Error checking Proofreader API availability:', error);
    return {
      available: false,
      status: 'no',
      message: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

/**
 * Letter Proofreader using Chrome Proofreader API
 */
export class LetterProofreader {
  private proofreader: any = null;
  private options: ProofreaderOptions;

  constructor(options: ProofreaderOptions = {}) {
    this.options = {
      expectedInputLanguages: options.expectedInputLanguages || ['en'],
    };
  }

  /**
   * Initialize the Proofreader API
   */
  async initialize(): Promise<void> {
    const availability = await checkProofreaderAvailability();

    if (!availability.available) {
      throw new Error(availability.message);
    }

    try {
      const ai = (window as any).ai;

      this.proofreader = await ai.proofreader.create({
        expectedInputLanguages: this.options.expectedInputLanguages,
      });
    } catch (error) {
      console.error('Error initializing Proofreader API:', error);
      throw new Error(`Failed to initialize Proofreader API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Proofread text and get corrections
   */
  async proofread(text: string, signal?: AbortSignal): Promise<ProofreadResult> {
    if (!this.proofreader) {
      throw new Error('Proofreader not initialized. Call initialize() first.');
    }

    try {
      const result = await this.proofreader.proofread(text, { signal });

      // Parse corrections from API response
      const corrections: Correction[] = [];

      if (result.corrections && Array.isArray(result.corrections)) {
        for (const correction of result.corrections) {
          corrections.push({
            startIndex: correction.startIndex || 0,
            endIndex: correction.endIndex || 0,
            original: correction.original || '',
            suggestion: correction.suggestion || '',
            type: correction.type || 'other',
          });
        }
      }

      return {
        corrected: result.corrected || text,
        corrections,
        originalText: text,
        correctionCount: corrections.length,
        hasErrors: corrections.length > 0,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Proofreading was cancelled');
      }
      console.error('Proofreading error:', error);
      throw error;
    }
  }

  /**
   * Destroy the proofreader and free resources
   */
  async destroy(): Promise<void> {
    if (this.proofreader && typeof this.proofreader.destroy === 'function') {
      try {
        await this.proofreader.destroy();
      } catch (error) {
        console.error('Error destroying proofreader:', error);
      } finally {
        this.proofreader = null;
      }
    }
  }

  /**
   * Check if proofreader is initialized
   */
  isInitialized(): boolean {
    return this.proofreader !== null;
  }
}

/**
 * Proofread letter and return corrected version
 */
export async function proofreadLetter(
  letter: string,
  signal?: AbortSignal
): Promise<ProofreadResult> {
  const proofreader = new LetterProofreader();

  try {
    await proofreader.initialize();
    return await proofreader.proofread(letter, signal);
  } finally {
    await proofreader.destroy();
  }
}

/**
 * Get just the corrected text (quick function)
 */
export async function quickProofread(
  text: string,
  signal?: AbortSignal
): Promise<string> {
  const result = await proofreadLetter(text, signal);
  return result.corrected;
}

/**
 * Check text for specific error types
 */
export interface ErrorTypeCount {
  spelling: number;
  grammar: number;
  punctuation: number;
  other: number;
  total: number;
}

export function analyzeErrorTypes(result: ProofreadResult): ErrorTypeCount {
  const counts: ErrorTypeCount = {
    spelling: 0,
    grammar: 0,
    punctuation: 0,
    other: 0,
    total: result.correctionCount,
  };

  for (const correction of result.corrections) {
    switch (correction.type) {
      case 'spelling':
        counts.spelling++;
        break;
      case 'grammar':
        counts.grammar++;
        break;
      case 'punctuation':
        counts.punctuation++;
        break;
      default:
        counts.other++;
    }
  }

  return counts;
}

/**
 * Format corrections for display
 */
export interface FormattedCorrection {
  position: string; // e.g., "Line 1, Position 15"
  original: string;
  suggestion: string;
  type: string;
  context: string; // Surrounding text for context
}

export function formatCorrections(
  result: ProofreadResult,
  contextLength: number = 20
): FormattedCorrection[] {
  const formatted: FormattedCorrection[] = [];

  for (const correction of result.corrections) {
    // Calculate line number and position
    const textBeforeError = result.originalText.substring(0, correction.startIndex);
    const lineNumber = textBeforeError.split('\n').length;
    const linePosition = textBeforeError.split('\n').pop()?.length || 0;

    // Get context around the error
    const contextStart = Math.max(0, correction.startIndex - contextLength);
    const contextEnd = Math.min(result.originalText.length, correction.endIndex + contextLength);
    const context = result.originalText.substring(contextStart, contextEnd);

    formatted.push({
      position: `Line ${lineNumber}, Position ${linePosition + 1}`,
      original: correction.original,
      suggestion: correction.suggestion,
      type: correction.type || 'other',
      context: context.trim(),
    });
  }

  return formatted;
}

/**
 * Apply corrections selectively
 */
export function applyCorrections(
  originalText: string,
  corrections: Correction[],
  applyIndices: number[] // Indices of corrections to apply
): string {
  // Sort corrections by start index in reverse order to avoid offset issues
  const sortedCorrections = corrections
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => applyIndices.includes(c.index))
    .sort((a, b) => b.startIndex - a.startIndex);

  let result = originalText;

  for (const correction of sortedCorrections) {
    result =
      result.substring(0, correction.startIndex) +
      correction.suggestion +
      result.substring(correction.endIndex);
  }

  return result;
}

/**
 * Real-time proofreading for text input
 * Returns partial results as user types
 */
export class RealtimeProofreader {
  private proofreader: LetterProofreader;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentText: string = '';
  private lastResult: ProofreadResult | null = null;

  constructor() {
    this.proofreader = new LetterProofreader();
  }

  async initialize(): Promise<void> {
    await this.proofreader.initialize();
  }

  /**
   * Check text with debouncing (waits for user to stop typing)
   */
  async checkText(
    text: string,
    onResult: (result: ProofreadResult) => void,
    debounceMs: number = 500
  ): Promise<void> {
    this.currentText = text;

    // Clear existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set new timeout
    this.debounceTimeout = setTimeout(async () => {
      try {
        const result = await this.proofreader.proofread(text);
        this.lastResult = result;
        onResult(result);
      } catch (error) {
        console.error('Realtime proofreading error:', error);
      }
    }, debounceMs);
  }

  getLastResult(): ProofreadResult | null {
    return this.lastResult;
  }

  async destroy(): Promise<void> {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    await this.proofreader.destroy();
  }
}
