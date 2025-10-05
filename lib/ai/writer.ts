// Chrome Writer API Integration
// Generates personalized letters to representatives

export interface WriterAvailability {
  available: boolean;
  status: 'readily' | 'downloading' | 'downloadable' | 'no';
  message: string;
}

export type WriterTone = 'formal' | 'neutral' | 'casual';
export type WriterLength = 'short' | 'medium' | 'long';

export interface WriterOptions {
  tone?: WriterTone;
  length?: WriterLength;
  sharedContext?: string;
}

export interface GeneratedLetter {
  content: string;
  tone: WriterTone;
  length: WriterLength;
  generatedAt: Date;
  wordCount: number;
}

/**
 * Check if Chrome Writer API is available
 */
export async function checkWriterAvailability(): Promise<WriterAvailability> {
  try {
    if (!('ai' in window) || !('writer' in (window as any).ai)) {
      return {
        available: false,
        status: 'no',
        message: 'Writer API not supported in this browser. Please use Chrome Canary with AI flags enabled.',
      };
    }

    const ai = (window as any).ai;
    const capabilities = await ai.writer.capabilities();

    if (!capabilities || capabilities.available === 'no') {
      return {
        available: false,
        status: 'no',
        message: 'Writer API not available on this device.',
      };
    }

    const status = capabilities.available;

    return {
      available: status === 'readily',
      status,
      message: status === 'readily'
        ? 'Writer API is ready to use'
        : status === 'downloading'
        ? 'AI model is downloading... Please wait.'
        : status === 'downloadable'
        ? 'AI model needs to be downloaded. This may require user interaction.'
        : 'Writer API is not available.',
    };
  } catch (error) {
    console.error('Error checking Writer API availability:', error);
    return {
      available: false,
      status: 'no',
      message: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

/**
 * Letter Writer using Chrome Writer API
 */
export class LetterWriter {
  private writer: any = null;
  private options: WriterOptions;

  constructor(options: WriterOptions = {}) {
    this.options = {
      tone: options.tone || 'formal',
      length: options.length || 'medium',
      sharedContext: options.sharedContext || 'Professional correspondence to elected representatives about legislation',
    };
  }

  /**
   * Initialize the Writer API
   */
  async initialize(): Promise<void> {
    const availability = await checkWriterAvailability();

    if (!availability.available) {
      throw new Error(availability.message);
    }

    try {
      const ai = (window as any).ai;

      this.writer = await ai.writer.create({
        tone: this.options.tone,
        length: this.options.length,
        sharedContext: this.options.sharedContext,
      });
    } catch (error) {
      console.error('Error initializing Writer API:', error);
      throw new Error(`Failed to initialize Writer API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write content based on a prompt
   */
  async write(prompt: string, signal?: AbortSignal): Promise<string> {
    if (!this.writer) {
      throw new Error('Writer not initialized. Call initialize() first.');
    }

    try {
      const content = await this.writer.write(prompt, { signal });
      return content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Writing was cancelled');
      }
      console.error('Writing error:', error);
      throw error;
    }
  }

  /**
   * Write content with streaming output
   */
  async writeStreaming(
    prompt: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.writer) {
      throw new Error('Writer not initialized. Call initialize() first.');
    }

    let fullContent = '';

    try {
      const stream = await this.writer.writeStreaming(prompt, { signal });

      for await (const chunk of stream) {
        fullContent += chunk;
        onChunk(chunk);
      }

      return fullContent;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Streaming was cancelled');
      }
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Destroy the writer and free resources
   */
  async destroy(): Promise<void> {
    if (this.writer && typeof this.writer.destroy === 'function') {
      try {
        await this.writer.destroy();
      } catch (error) {
        console.error('Error destroying writer:', error);
      } finally {
        this.writer = null;
      }
    }
  }

  /**
   * Check if writer is initialized
   */
  isInitialized(): boolean {
    return this.writer !== null;
  }
}

/**
 * Letter input structure
 */
export interface LetterInput {
  // Basic Information
  billTitle: string;
  billNumber?: string;
  position: 'support' | 'oppose' | 'concerned' | 'neutral';

  // Recipient
  recipientName: string;
  recipientTitle: string; // e.g., "Representative", "Senator"
  recipientAddress?: string;

  // Content
  personalStory?: string;
  keyPoints: string[];
  specificRequest?: string; // What you want them to do

  // Customization
  tone?: WriterTone;
  length?: WriterLength;
  includeCallToAction?: boolean;
}

/**
 * Generate a letter to a representative
 */
export async function generateLetter(
  input: LetterInput,
  signal?: AbortSignal
): Promise<GeneratedLetter> {
  const writer = new LetterWriter({
    tone: input.tone || 'formal',
    length: input.length || 'medium',
  });

  try {
    await writer.initialize();

    const positionText = {
      support: 'I am writing to express my strong support for',
      oppose: 'I am writing to express my opposition to',
      concerned: 'I am writing to share my concerns about',
      neutral: 'I am writing to share my perspective on',
    }[input.position];

    const billReference = input.billNumber
      ? `${input.billTitle} (${input.billNumber})`
      : input.billTitle;

    // Build the prompt
    let prompt = `Write a professional letter to ${input.recipientTitle} ${input.recipientName} about "${billReference}".

Opening: ${positionText} this legislation.

`;

    if (input.personalStory) {
      prompt += `Personal Context: ${input.personalStory}\n\n`;
    }

    prompt += `Key Points to Address:\n`;
    input.keyPoints.forEach((point, i) => {
      prompt += `${i + 1}. ${point}\n`;
    });

    if (input.specificRequest) {
      prompt += `\nSpecific Request: ${input.specificRequest}\n`;
    }

    if (input.includeCallToAction !== false) {
      prompt += `\nInclude a clear call to action asking the representative to take specific action on this bill.\n`;
    }

    prompt += `\nThe letter should be:
- Respectful and professional
- Clear and concise
- Persuasive without being confrontational
- Grounded in facts and personal experience
- Include proper letter formatting (date, greeting, body, closing)`;

    const content = await writer.write(prompt, signal);

    // Count words
    const wordCount = content.split(/\s+/).length;

    return {
      content,
      tone: input.tone || 'formal',
      length: input.length || 'medium',
      generatedAt: new Date(),
      wordCount,
    };
  } finally {
    await writer.destroy();
  }
}

/**
 * Generate letter with streaming output
 */
export async function generateLetterStreaming(
  input: LetterInput,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<GeneratedLetter> {
  const writer = new LetterWriter({
    tone: input.tone || 'formal',
    length: input.length || 'medium',
  });

  try {
    await writer.initialize();

    const positionText = {
      support: 'I am writing to express my strong support for',
      oppose: 'I am writing to express my opposition to',
      concerned: 'I am writing to share my concerns about',
      neutral: 'I am writing to share my perspective on',
    }[input.position];

    const billReference = input.billNumber
      ? `${input.billTitle} (${input.billNumber})`
      : input.billTitle;

    let prompt = `Write a professional letter to ${input.recipientTitle} ${input.recipientName} about "${billReference}".

Opening: ${positionText} this legislation.

`;

    if (input.personalStory) {
      prompt += `Personal Context: ${input.personalStory}\n\n`;
    }

    prompt += `Key Points to Address:\n`;
    input.keyPoints.forEach((point, i) => {
      prompt += `${i + 1}. ${point}\n`;
    });

    if (input.specificRequest) {
      prompt += `\nSpecific Request: ${input.specificRequest}\n`;
    }

    if (input.includeCallToAction !== false) {
      prompt += `\nInclude a clear call to action.\n`;
    }

    prompt += `\nThe letter should be respectful, professional, and persuasive. Include proper letter formatting.`;

    const content = await writer.writeStreaming(prompt, onChunk, signal);
    const wordCount = content.split(/\s+/).length;

    return {
      content,
      tone: input.tone || 'formal',
      length: input.length || 'medium',
      generatedAt: new Date(),
      wordCount,
    };
  } finally {
    await writer.destroy();
  }
}

/**
 * Generate multiple letter variations
 */
export async function generateLetterVariations(
  input: LetterInput,
  count: number = 3,
  signal?: AbortSignal
): Promise<GeneratedLetter[]> {
  const variations: GeneratedLetter[] = [];
  const tones: WriterTone[] = ['formal', 'neutral', 'casual'];

  for (let i = 0; i < Math.min(count, 3); i++) {
    const letter = await generateLetter(
      {
        ...input,
        tone: tones[i],
      },
      signal
    );
    variations.push(letter);
  }

  return variations;
}
