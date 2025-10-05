// Chrome Rewriter API Integration
// Rewrites and optimizes content with different tones and lengths

export interface RewriterAvailability {
  available: boolean;
  status: 'readily' | 'downloading' | 'downloadable' | 'no';
  message: string;
}

export type RewriteTone = 'as-is' | 'more-formal' | 'more-casual';
export type RewriteLength = 'as-is' | 'shorter' | 'longer';
export type RewriteFormat = 'as-is' | 'plain-text' | 'markdown';

export interface RewriterOptions {
  tone?: RewriteTone;
  length?: RewriteLength;
  format?: RewriteFormat;
  sharedContext?: string;
}

export interface RewrittenContent {
  original: string;
  rewritten: string;
  tone: RewriteTone;
  length: RewriteLength;
  format: RewriteFormat;
  originalWordCount: number;
  rewrittenWordCount: number;
  generatedAt: Date;
}

/**
 * Check if Chrome Rewriter API is available
 */
export async function checkRewriterAvailability(): Promise<RewriterAvailability> {
  try {
    if (!('ai' in window) || !('rewriter' in (window as any).ai)) {
      return {
        available: false,
        status: 'no',
        message: 'Rewriter API not supported in this browser. Please use Chrome Canary with AI flags enabled.',
      };
    }

    const ai = (window as any).ai;
    const capabilities = await ai.rewriter.capabilities();

    if (!capabilities || capabilities.available === 'no') {
      return {
        available: false,
        status: 'no',
        message: 'Rewriter API not available on this device.',
      };
    }

    const status = capabilities.available;

    return {
      available: status === 'readily',
      status,
      message: status === 'readily'
        ? 'Rewriter API is ready to use'
        : status === 'downloading'
        ? 'AI model is downloading... Please wait.'
        : status === 'downloadable'
        ? 'AI model needs to be downloaded. This may require user interaction.'
        : 'Rewriter API is not available.',
    };
  } catch (error) {
    console.error('Error checking Rewriter API availability:', error);
    return {
      available: false,
      status: 'no',
      message: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

/**
 * Content Rewriter using Chrome Rewriter API
 */
export class ContentRewriter {
  private rewriter: any = null;
  private options: RewriterOptions;

  constructor(options: RewriterOptions = {}) {
    this.options = {
      tone: options.tone || 'as-is',
      length: options.length || 'as-is',
      format: options.format || 'as-is',
      sharedContext: options.sharedContext,
    };
  }

  /**
   * Initialize the Rewriter API
   */
  async initialize(): Promise<void> {
    const availability = await checkRewriterAvailability();

    if (!availability.available) {
      throw new Error(availability.message);
    }

    try {
      const ai = (window as any).ai;

      this.rewriter = await ai.rewriter.create({
        tone: this.options.tone,
        length: this.options.length,
        format: this.options.format,
        sharedContext: this.options.sharedContext,
      });
    } catch (error) {
      console.error('Error initializing Rewriter API:', error);
      throw new Error(`Failed to initialize Rewriter API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rewrite content
   */
  async rewrite(text: string, signal?: AbortSignal): Promise<string> {
    if (!this.rewriter) {
      throw new Error('Rewriter not initialized. Call initialize() first.');
    }

    try {
      const rewritten = await this.rewriter.rewrite(text, { signal });
      return rewritten;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Rewriting was cancelled');
      }
      console.error('Rewriting error:', error);
      throw error;
    }
  }

  /**
   * Rewrite with streaming output
   */
  async rewriteStreaming(
    text: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.rewriter) {
      throw new Error('Rewriter not initialized. Call initialize() first.');
    }

    let fullRewritten = '';

    try {
      const stream = await this.rewriter.rewriteStreaming(text, { signal });

      for await (const chunk of stream) {
        fullRewritten += chunk;
        onChunk(chunk);
      }

      return fullRewritten;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Streaming was cancelled');
      }
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Destroy the rewriter and free resources
   */
  async destroy(): Promise<void> {
    if (this.rewriter && typeof this.rewriter.destroy === 'function') {
      try {
        await this.rewriter.destroy();
      } catch (error) {
        console.error('Error destroying rewriter:', error);
      } finally {
        this.rewriter = null;
      }
    }
  }

  /**
   * Check if rewriter is initialized
   */
  isInitialized(): boolean {
    return this.rewriter !== null;
  }
}

/**
 * Simplify legal/legislative text for general audience
 */
export async function simplifyLegalText(
  text: string,
  signal?: AbortSignal
): Promise<RewrittenContent> {
  const rewriter = new ContentRewriter({
    tone: 'more-casual',
    length: 'as-is',
    sharedContext: 'Simplify legal and legislative language for general audience. Use plain English.',
  });

  try {
    await rewriter.initialize();

    const originalWordCount = text.split(/\s+/).length;
    const rewritten = await rewriter.rewrite(text, signal);
    const rewrittenWordCount = rewritten.split(/\s+/).length;

    return {
      original: text,
      rewritten,
      tone: 'more-casual',
      length: 'as-is',
      format: 'as-is',
      originalWordCount,
      rewrittenWordCount,
      generatedAt: new Date(),
    };
  } finally {
    await rewriter.destroy();
  }
}

/**
 * Make content more formal for official correspondence
 */
export async function formalizeLetter(
  text: string,
  signal?: AbortSignal
): Promise<RewrittenContent> {
  const rewriter = new ContentRewriter({
    tone: 'more-formal',
    length: 'as-is',
    sharedContext: 'Professional correspondence to elected representatives',
  });

  try {
    await rewriter.initialize();

    const originalWordCount = text.split(/\s+/).length;
    const rewritten = await rewriter.rewrite(text, signal);
    const rewrittenWordCount = rewritten.split(/\s+/).length;

    return {
      original: text,
      rewritten,
      tone: 'more-formal',
      length: 'as-is',
      format: 'as-is',
      originalWordCount,
      rewrittenWordCount,
      generatedAt: new Date(),
    };
  } finally {
    await rewriter.destroy();
  }
}

/**
 * Shorten content while preserving key points
 */
export async function condenseText(
  text: string,
  signal?: AbortSignal
): Promise<RewrittenContent> {
  const rewriter = new ContentRewriter({
    tone: 'as-is',
    length: 'shorter',
  });

  try {
    await rewriter.initialize();

    const originalWordCount = text.split(/\s+/).length;
    const rewritten = await rewriter.rewrite(text, signal);
    const rewrittenWordCount = rewritten.split(/\s+/).length;

    return {
      original: text,
      rewritten,
      tone: 'as-is',
      length: 'shorter',
      format: 'as-is',
      originalWordCount,
      rewrittenWordCount,
      generatedAt: new Date(),
    };
  } finally {
    await rewriter.destroy();
  }
}

/**
 * Expand content with more detail
 */
export async function expandText(
  text: string,
  signal?: AbortSignal
): Promise<RewrittenContent> {
  const rewriter = new ContentRewriter({
    tone: 'as-is',
    length: 'longer',
  });

  try {
    await rewriter.initialize();

    const originalWordCount = text.split(/\s+/).length;
    const rewritten = await rewriter.rewrite(text, signal);
    const rewrittenWordCount = rewritten.split(/\s+/).length;

    return {
      original: text,
      rewritten,
      tone: 'as-is',
      length: 'longer',
      format: 'as-is',
      originalWordCount,
      rewrittenWordCount,
      generatedAt: new Date(),
    };
  } finally {
    await rewriter.destroy();
  }
}

/**
 * Generate multiple variations of text
 */
export async function generateVariations(
  text: string,
  count: number = 3,
  signal?: AbortSignal
): Promise<RewrittenContent[]> {
  const variations: RewrittenContent[] = [];
  const configs: RewriterOptions[] = [
    { tone: 'more-formal', length: 'as-is' },
    { tone: 'more-casual', length: 'as-is' },
    { tone: 'as-is', length: 'shorter' },
  ];

  for (let i = 0; i < Math.min(count, 3); i++) {
    const rewriter = new ContentRewriter(configs[i]);

    try {
      await rewriter.initialize();

      const originalWordCount = text.split(/\s+/).length;
      const rewritten = await rewriter.rewrite(text, signal);
      const rewrittenWordCount = rewritten.split(/\s+/).length;

      variations.push({
        original: text,
        rewritten,
        tone: configs[i].tone || 'as-is',
        length: configs[i].length || 'as-is',
        format: 'as-is',
        originalWordCount,
        rewrittenWordCount,
        generatedAt: new Date(),
      });
    } finally {
      await rewriter.destroy();
    }
  }

  return variations;
}
