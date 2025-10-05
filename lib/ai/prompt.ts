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
 */
export async function checkPromptAvailability(): Promise<PromptAvailability> {
  try {
    if (!('ai' in window) || !('languageModel' in (window as any).ai)) {
      return {
        available: false,
        status: 'no',
        message: 'Prompt API not supported in this browser. Please use Chrome Canary with AI flags enabled.',
      };
    }

    const ai = (window as any).ai;
    const capabilities = await ai.languageModel.capabilities();

    if (!capabilities || capabilities.available === 'no') {
      return {
        available: false,
        status: 'no',
        message: 'Prompt API not available on this device.',
      };
    }

    const status = capabilities.available;

    return {
      available: status === 'readily',
      status,
      message: status === 'readily'
        ? 'Prompt API is ready to use'
        : status === 'downloading'
        ? 'AI model is downloading... Please wait.'
        : status === 'downloadable'
        ? 'AI model needs to be downloaded. This may require user interaction.'
        : 'Prompt API is not available.',
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
   */
  async initialize(): Promise<void> {
    const availability = await checkPromptAvailability();

    if (!availability.available) {
      throw new Error(availability.message);
    }

    try {
      const ai = (window as any).ai;

      this.session = await ai.languageModel.create({
        systemPrompt: this.systemPrompt,
        temperature: this.options.temperature,
        topK: this.options.topK,
      });
    } catch (error) {
      console.error('Error initializing Prompt API session:', error);
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
