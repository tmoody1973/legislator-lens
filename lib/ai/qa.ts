// Interactive Q&A using Chrome Prompt API
// Provides conversational bill exploration with context retention

import { LegislativeAnalyzer } from './prompt';

export interface QAMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface QASession {
  sessionId: string;
  billTitle: string;
  messages: QAMessage[];
  createdAt: Date;
}

/**
 * Bill Q&A Session Manager
 * Maintains conversation context about a specific bill
 */
export class BillQASession {
  private analyzer: LegislativeAnalyzer;
  private billContext: string;
  private billTitle: string;
  private messages: QAMessage[] = [];
  private sessionId: string;

  constructor(billTitle: string, billText: string, billSummary?: string) {
    this.billTitle = billTitle;
    this.sessionId = `qa-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Prepare context (limit to avoid token limits)
    const contextParts: string[] = [];

    if (billSummary) {
      contextParts.push(`Summary: ${billSummary}`);
    }

    contextParts.push(billText.substring(0, 12000)); // Limit bill text

    this.billContext = contextParts.join('\n\n');

    const systemPrompt = `You are helping citizens understand this specific congressional bill: "${billTitle}".

Your role:
- Answer questions clearly and concisely based on the bill's content
- Explain complex legal language in plain terms
- Provide specific citations to bill sections when possible
- If you don't know something, say so - don't make assumptions
- Maintain political neutrality
- Help users understand impacts, stakeholders, and implications

Guidelines:
- Keep answers focused and relevant
- Use examples to clarify complex concepts
- Acknowledge uncertainty when appropriate
- Suggest related questions users might want to ask`;

    this.analyzer = new LegislativeAnalyzer(systemPrompt);
  }

  /**
   * Initialize the Q&A session
   */
  async initialize(): Promise<void> {
    console.log('BillQASession: Initializing analyzer...');
    await this.analyzer.initialize();

    console.log('BillQASession: Analyzer initialized, providing context...');
    // Provide initial context about the bill
    const contextMessage = `Here is the bill information for reference:

${this.billContext}

I'll be answering questions about this bill. The user may ask about provisions, impacts, stakeholders, or anything else related to this legislation.`;

    console.log('BillQASession: Sending context to analyzer...');
    await this.analyzer.prompt(contextMessage);
    console.log('BillQASession: Context sent, initialization complete!');
  }

  /**
   * Ask a question and get a complete answer
   */
  async ask(question: string, signal?: AbortSignal): Promise<string> {
    if (!this.analyzer.isInitialized()) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    // Add user message to history
    this.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    try {
      const answer = await this.analyzer.prompt(question, signal);

      // Add assistant message to history
      this.messages.push({
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      });

      return answer;
    } catch (error) {
      // Remove user message if answer failed
      this.messages.pop();
      throw error;
    }
  }

  /**
   * Ask a question with streaming response
   */
  async askStreaming(
    question: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ): Promise<string> {
    if (!this.analyzer.isInitialized()) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    // Add user message to history
    this.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    let fullAnswer = '';

    try {
      await this.analyzer.streamPrompt(
        question,
        (chunk) => {
          fullAnswer += chunk;
          onChunk(chunk);
        },
        signal
      );

      // Add complete assistant message to history
      this.messages.push({
        role: 'assistant',
        content: fullAnswer,
        timestamp: new Date(),
      });

      return fullAnswer;
    } catch (error) {
      // Remove user message if answer failed
      this.messages.pop();
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): QAMessage[] {
    return [...this.messages];
  }

  /**
   * Get session metadata
   */
  getSession(): QASession {
    return {
      sessionId: this.sessionId,
      billTitle: this.billTitle,
      messages: this.getHistory(),
      createdAt: new Date(parseInt(this.sessionId.split('-')[1])),
    };
  }

  /**
   * Clear conversation history (keeps context)
   */
  clearHistory(): void {
    this.messages = [];
  }

  /**
   * Destroy the session and free resources
   */
  async destroy(): Promise<void> {
    await this.analyzer.destroy();
  }
}

/**
 * Generate suggested follow-up questions
 */
export async function suggestFollowUpQuestions(
  billTitle: string,
  billSummary: string,
  conversationHistory: QAMessage[],
  signal?: AbortSignal
): Promise<string[]> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const recentMessages = conversationHistory.slice(-6); // Last 3 exchanges
    const conversationContext = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `Based on this conversation about "${billTitle}", suggest 3-5 relevant follow-up questions the user might want to ask.

Bill Summary: ${billSummary}

Recent Conversation:
${conversationContext}

Return ONLY a JSON array of question strings:
["Question 1?", "Question 2?", "Question 3?"]

Make questions:
- Specific and actionable
- Build on what's been discussed
- Cover different aspects (provisions, impacts, stakeholders, etc.)
- Help users explore the bill more deeply`;

    const response = await analyzer.prompt(prompt, signal);

    // Parse JSON array from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(questions)) {
        return questions.slice(0, 5);
      }
    }

    // Fallback questions if parsing fails
    return [
      'What are the main provisions of this bill?',
      'Who would be most affected by this legislation?',
      'Are there any controversial aspects to this bill?',
    ];
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return [
      'What are the key points of this bill?',
      'How would this affect me?',
      'What happens next with this bill?',
    ];
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Quick answer for common bill questions
 */
export async function quickAnswer(
  billTitle: string,
  billSummary: string,
  question: string,
  signal?: AbortSignal
): Promise<string> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Answer this question about the bill concisely (2-3 sentences max).

Bill: ${billTitle}
Summary: ${billSummary}

Question: ${question}

Provide a brief, clear answer based on the bill information.`;

    const answer = await analyzer.prompt(prompt, signal);
    return answer;
  } finally {
    await analyzer.destroy();
  }
}
