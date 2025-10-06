// Chrome Prompt API (Language Model) Integration
// Provides intelligent bill analysis, categorization, and Q&A

export interface PromptAvailability {
  available: boolean;
  status: 'readily' | 'downloading' | 'downloadable' | 'no';
  message: string;
}

export interface PromptOptions {
  temperature?: number;
  topK?: number;
  systemPrompt?: string;
}

/**
 * Check if Chrome Prompt API (Language Model) is available
 * Using Chrome 138+ stable API
 */
export async function checkPromptAvailability(): Promise<PromptAvailability> {
  if (typeof window === 'undefined') {
    return {
      available: false,
      status: 'no',
      message: 'Prompt API only available in browser',
    };
  }

  try {
    // Check for Chrome 138+ stable API: LanguageModel (global)
    if (!('LanguageModel' in self)) {
      return {
        available: false,
        status: 'no',
        message: 'Prompt API not supported. Please use Chrome 138+ with built-in AI support.',
      };
    }

    const availability = await (self as any).LanguageModel.availability();
    console.log('Prompt API raw availability:', availability);

    // Chrome Prompt API returns: 'unavailable', 'downloadable', or 'downloading'
    // Note: There is no 'available' status - if it's ready, create() will work
    if (availability === 'downloadable') {
      return {
        available: false,
        status: 'downloadable',
        message: 'AI model ready to download. Click to start download.',
      };
    }

    if (availability === 'downloading') {
      return {
        available: false,
        status: 'downloading',
        message: 'AI model is downloading...',
      };
    }

    if (availability === 'unavailable') {
      return {
        available: false,
        status: 'no',
        message: 'Prompt API is not available on this device. Check system requirements.',
      };
    }

    // Any other status (future-proofing)
    // Try to proceed anyway - create() might work
    return {
      available: true,
      status: 'readily',
      message: 'Prompt API status unknown, attempting to use',
    };
  } catch (error) {
    console.error('Error checking Prompt API availability:', error);
    return {
      available: false,
      status: 'no',
      message: error instanceof Error ? error.message : 'Unknown error checking availability',
    };
  }
}

/**
 * Legislative Analyzer using Chrome Prompt API
 * Manages session lifecycle and provides analysis capabilities
 */
export class LegislativeAnalyzer {
  private session: any = null;
  private systemPrompt: string;
  private options: PromptOptions;

  constructor(systemPrompt?: string, options: PromptOptions = {}) {
    this.systemPrompt = systemPrompt || `You are a legislative analyst helping citizens understand congressional bills.
Provide clear, unbiased analysis in plain language.
Focus on explaining impacts, stakeholders, and key provisions.
Always maintain political neutrality and cite specific bill sections when relevant.
Format responses in clean, readable JSON when requested.`;

    this.options = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
    };
  }

  /**
   * Initialize the Prompt API session
   * Using Chrome 138+ stable API
   */
  async initialize(): Promise<void> {
    console.log('LegislativeAnalyzer: Checking availability...');
    const availability = await checkPromptAvailability();
    console.log('LegislativeAnalyzer: Availability result:', availability);

    // Allow both 'readily' (available=true) and 'downloadable' (available=false)
    if (availability.status === 'no') {
      throw new Error(availability.message);
    }

    try {
      console.log('LegislativeAnalyzer: Calling LanguageModel.create()...');
      console.log('LegislativeAnalyzer: Status is', availability.status);

      // Create with timeout to prevent indefinite hanging
      const createPromise = (self as any).LanguageModel.create({
        systemPrompt: this.systemPrompt,
        temperature: this.options.temperature,
        topK: this.options.topK,
        language: 'en', // Required: specify output language (en, es, or ja)
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Model creation timed out after 30 seconds. The model may still be downloading. Please try again in a moment.')), 30000);
      });

      this.session = await Promise.race([createPromise, timeoutPromise]);
      console.log('LegislativeAnalyzer: LanguageModel.create() succeeded!');
    } catch (error) {
      console.error('LegislativeAnalyzer: Error initializing Prompt API session:', error);
      throw new Error(`Failed to initialize Prompt API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a prompt and get a complete response
   */
  async prompt(message: string, signal?: AbortSignal): Promise<string> {
    if (!this.session) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    try {
      const response = await this.session.prompt(message, { signal });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Prompt was cancelled');
      }
      console.error('Prompt error:', error);
      throw error;
    }
  }

  /**
   * Send a prompt and stream the response in chunks
   */
  async streamPrompt(
    message: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    try {
      const stream = await this.session.promptStreaming(message, { signal });

      for await (const chunk of stream) {
        onChunk(chunk);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Streaming was cancelled');
      }
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Clone the current session
   * Useful for maintaining context across multiple conversations
   */
  async clone(): Promise<LegislativeAnalyzer> {
    if (!this.session) {
      throw new Error('Cannot clone uninitialized session');
    }

    const cloned = new LegislativeAnalyzer(this.systemPrompt, this.options);
    cloned.session = await this.session.clone();
    return cloned;
  }

  /**
   * Destroy the session and free resources
   */
  async destroy(): Promise<void> {
    if (this.session && typeof this.session.destroy === 'function') {
      try {
        await this.session.destroy();
      } catch (error) {
        console.error('Error destroying session:', error);
      } finally {
        this.session = null;
      }
    }
  }

  /**
   * Check if session is initialized
   */
  isInitialized(): boolean {
    return this.session !== null;
  }
}

/**
 * Helper function to safely parse JSON from AI responses
 */
export function parseAIJsonResponse<T>(response: string): T {
  // Try to find JSON in the response
  const jsonMatch = response.match(/\[[\s\S]*\]|\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No valid JSON found in response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Attempted to parse:', jsonMatch[0]);
    throw new Error('Failed to parse AI response as JSON');
  }
}
