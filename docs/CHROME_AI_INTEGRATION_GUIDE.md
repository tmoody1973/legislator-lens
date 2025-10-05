# Chrome AI APIs - Integration Guide

## Overview

This guide provides detailed implementation instructions for integrating Chrome's built-in AI APIs into Legislator Lens. All APIs support local processing for privacy and offline functionality.

## API Availability & Detection

### Check API Support

Before using any Chrome AI API, check if it's available and ready:

```typescript
// lib/ai/availability.ts

export interface AIAvailability {
  summarizer: boolean;
  prompt: boolean;
  writer: boolean;
  rewriter: boolean;
  proofreader: boolean;
  translator: boolean;
}

export async function checkAIAvailability(): Promise<AIAvailability> {
  const availability: AIAvailability = {
    summarizer: false,
    prompt: false,
    writer: false,
    rewriter: false,
    proofreader: false,
    translator: false,
  };

  // Check Summarizer API
  if ('ai' in window && 'summarizer' in window.ai) {
    const summarizerAvailability = await window.ai.summarizer.availability();
    availability.summarizer = summarizerAvailability === 'readily';
  }

  // Check Prompt API (Language Model)
  if ('ai' in window && 'languageModel' in window.ai) {
    const promptAvailability = await window.ai.languageModel.availability();
    availability.prompt = promptAvailability === 'readily';
  }

  // Check Writer API
  if ('ai' in window && 'writer' in window.ai) {
    const writerAvailability = await window.ai.writer.availability();
    availability.writer = writerAvailability === 'readily';
  }

  // Check Rewriter API
  if ('ai' in window && 'rewriter' in window.ai) {
    const rewriterAvailability = await window.ai.rewriter.availability();
    availability.rewriter = rewriterAvailability === 'readily';
  }

  // Check Proofreader API
  if ('ai' in window && 'proofreader' in window.ai) {
    const proofreaderAvailability = await window.ai.proofreader.availability();
    availability.proofreader = proofreaderAvailability === 'readily';
  }

  // Check Translator API
  if ('ai' in window && 'translator' in window.ai) {
    availability.translator = true; // Check specific language pairs as needed
  }

  return availability;
}

// Handle model downloads
export async function handleModelDownload(
  apiName: keyof AIAvailability,
  onProgress?: (progress: number) => void
): Promise<boolean> {
  try {
    const api = window.ai[apiName === 'prompt' ? 'languageModel' : apiName];
    const availability = await api.availability();

    if (availability === 'downloadable') {
      // Model needs to be downloaded
      // Note: User activation (click) may be required
      console.log(`${apiName} model needs download`);
      return false;
    }

    if (availability === 'downloading') {
      console.log(`${apiName} model is downloading...`);
      // Monitor download progress if supported
      return false;
    }

    return availability === 'readily';
  } catch (error) {
    console.error(`Error checking ${apiName} availability:`, error);
    return false;
  }
}
```

## 1. Summarizer API Implementation

### Basic Usage

```typescript
// lib/ai/summarizer.ts

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
}

export class BillSummarizer {
  private summarizer: any = null;

  async initialize(options: SummarizerOptions = {}): Promise<void> {
    if (!('ai' in window) || !('summarizer' in window.ai)) {
      throw new Error('Summarizer API not available');
    }

    const availability = await window.ai.summarizer.availability();

    if (availability === 'no') {
      throw new Error('Summarizer API not supported on this device');
    }

    if (availability === 'downloadable') {
      throw new Error('Summarizer model needs to be downloaded');
    }

    this.summarizer = await window.ai.summarizer.create({
      type: options.type || 'key-points',
      format: options.format || 'markdown',
      length: options.length || 'medium',
      sharedContext: options.sharedContext || 'Congressional legislation analysis',
    });
  }

  async summarize(text: string): Promise<string> {
    if (!this.summarizer) {
      throw new Error('Summarizer not initialized');
    }

    try {
      const summary = await this.summarizer.summarize(text);
      return summary;
    } catch (error) {
      console.error('Summarization error:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.summarizer && typeof this.summarizer.destroy === 'function') {
      await this.summarizer.destroy();
      this.summarizer = null;
    }
  }
}

// Usage example
export async function summarizeBill(
  billText: string,
  options: SummarizerOptions = {}
): Promise<BillSummary> {
  const summarizer = new BillSummarizer();

  try {
    await summarizer.initialize(options);
    const summary = await summarizer.summarize(billText);

    return {
      summary,
      type: options.type || 'key-points',
      length: options.length || 'medium',
      format: options.format || 'markdown',
      generatedAt: new Date(),
    };
  } finally {
    await summarizer.destroy();
  }
}

// Generate multiple summary types
export async function generateAllSummaries(billText: string): Promise<{
  keyPoints: BillSummary;
  tldr: BillSummary;
  teaser: BillSummary;
  headline: BillSummary;
}> {
  const [keyPoints, tldr, teaser, headline] = await Promise.all([
    summarizeBill(billText, { type: 'key-points', length: 'medium' }),
    summarizeBill(billText, { type: 'tl;dr', length: 'short' }),
    summarizeBill(billText, { type: 'teaser', length: 'short' }),
    summarizeBill(billText, { type: 'headline', length: 'short' }),
  ]);

  return { keyPoints, tldr, teaser, headline };
}
```

### Caching Strategy

```typescript
// lib/ai/cache.ts

import { BillSummary } from './summarizer';

interface CachedSummary extends BillSummary {
  billId: string;
  cacheKey: string;
}

const SUMMARY_CACHE_KEY = 'bill-summaries-cache';

export class SummaryCache {
  private cache: Map<string, CachedSummary> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private getCacheKey(billId: string, type: SummaryType): string {
    return `${billId}-${type}`;
  }

  get(billId: string, type: SummaryType): BillSummary | null {
    const cacheKey = this.getCacheKey(billId, type);
    return this.cache.get(cacheKey) || null;
  }

  set(billId: string, summary: BillSummary): void {
    const cacheKey = this.getCacheKey(billId, summary.type);
    this.cache.set(cacheKey, {
      ...summary,
      billId,
      cacheKey,
    });
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(SUMMARY_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading summary cache:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.cache);
      localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving summary cache:', error);
    }
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(SUMMARY_CACHE_KEY);
  }
}

export const summaryCache = new SummaryCache();
```

## 2. Prompt API Implementation

### Session Management

```typescript
// lib/ai/prompt.ts

export interface PromptSession {
  session: any;
  systemPrompt: string;
  createdAt: Date;
}

export class LegislativeAnalyzer {
  private session: any = null;
  private systemPrompt: string;

  constructor(systemPrompt?: string) {
    this.systemPrompt = systemPrompt || `You are a legislative analyst helping citizens understand congressional bills.
Provide clear, unbiased analysis in plain language.
Focus on explaining impacts, stakeholders, and key provisions.
Always maintain political neutrality.`;
  }

  async initialize(): Promise<void> {
    if (!('ai' in window) || !('languageModel' in window.ai)) {
      throw new Error('Prompt API not available');
    }

    const availability = await window.ai.languageModel.availability();

    if (availability === 'no') {
      throw new Error('Language Model not supported');
    }

    this.session = await window.ai.languageModel.create({
      systemPrompt: this.systemPrompt,
    });
  }

  async prompt(message: string): Promise<string> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    try {
      const response = await this.session.prompt(message);
      return response;
    } catch (error) {
      console.error('Prompt error:', error);
      throw error;
    }
  }

  async streamPrompt(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    try {
      const stream = await this.session.promptStreaming(message);

      for await (const chunk of stream) {
        onChunk(chunk);
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.session && typeof this.session.destroy === 'function') {
      await this.session.destroy();
      this.session = null;
    }
  }
}
```

### Bill Categorization

```typescript
// lib/ai/categorization.ts

export interface BillCategory {
  name: string;
  confidence: number;
  description?: string;
}

export async function categorizeBill(
  billTitle: string,
  billSummary: string
): Promise<BillCategory[]> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Analyze this congressional bill and suggest 3-5 contextual categories.
Consider current events, policy areas, and stakeholder impacts.

Bill Title: ${billTitle}
Summary: ${billSummary}

Return ONLY a JSON array of categories with this structure:
[
  {
    "name": "Category Name",
    "confidence": 0.95,
    "description": "Brief explanation"
  }
]

Categories should be specific and meaningful (e.g., "Post-Pandemic Recovery", "Climate Resilience", "Digital Privacy Rights").`;

    const response = await analyzer.prompt(prompt);

    // Parse JSON response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } finally {
    await analyzer.destroy();
  }
}
```

### Key Provision Extraction

```typescript
// lib/ai/provisions.ts

export interface Provision {
  title: string;
  description: string;
  impact: string;
  stakeholders: string[];
  section?: string;
}

export async function extractKeyProvisions(
  billText: string,
  maxProvisions: number = 5
): Promise<Provision[]> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Analyze this bill and extract the ${maxProvisions} most important provisions.
For each provision, explain:
1. What it does
2. Who it affects
3. Potential impact

Bill Text:
${billText.substring(0, 10000)} // Limit text length

Return ONLY a JSON array:
[
  {
    "title": "Provision Title",
    "description": "What this provision does",
    "impact": "Potential effects",
    "stakeholders": ["Group 1", "Group 2"],
    "section": "Section number if available"
  }
]`;

    const response = await analyzer.prompt(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } finally {
    await analyzer.destroy();
  }
}
```

### Interactive Q&A

```typescript
// lib/ai/qa.ts

export class BillQASession {
  private analyzer: LegislativeAnalyzer;
  private billContext: string;

  constructor(billTitle: string, billText: string) {
    const systemPrompt = `You are helping citizens understand this specific bill: "${billTitle}".
Answer questions clearly and concisely based on the bill's content.
If you don't know something, say so - don't make assumptions.`;

    this.analyzer = new LegislativeAnalyzer(systemPrompt);
    this.billContext = billText.substring(0, 15000); // Context limit
  }

  async initialize(): Promise<void> {
    await this.analyzer.initialize();

    // Provide initial context
    await this.analyzer.prompt(`Here is the bill text for reference:
${this.billContext}

I'll be asking you questions about this bill.`);
  }

  async ask(question: string): Promise<string> {
    return await this.analyzer.prompt(question);
  }

  async askStreaming(
    question: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    await this.analyzer.streamPrompt(question, onChunk);
  }

  async destroy(): Promise<void> {
    await this.analyzer.destroy();
  }
}
```

## 3. Writer API Implementation

### Letter Generation

```typescript
// lib/ai/writer.ts

export type LetterTone = 'formal' | 'casual' | 'professional';
export type LetterLength = 'short' | 'medium' | 'long';

export interface LetterOptions {
  tone?: LetterTone;
  length?: LetterLength;
  sharedContext?: string;
}

export interface LetterInput {
  billTitle: string;
  position: 'support' | 'oppose' | 'concerned';
  personalStory?: string;
  keyPoints: string[];
  recipientName: string;
  recipientTitle: string;
}

export class LetterWriter {
  private writer: any = null;

  async initialize(options: LetterOptions = {}): Promise<void> {
    if (!('ai' in window) || !('writer' in window.ai)) {
      throw new Error('Writer API not available');
    }

    this.writer = await window.ai.writer.create({
      tone: options.tone || 'formal',
      length: options.length || 'medium',
      sharedContext: options.sharedContext || 'Correspondence to elected representatives about legislation',
    });
  }

  async write(prompt: string): Promise<string> {
    if (!this.writer) {
      throw new Error('Writer not initialized');
    }

    try {
      const letter = await this.writer.write(prompt);
      return letter;
    } catch (error) {
      console.error('Writing error:', error);
      throw error;
    }
  }

  async writeStreaming(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.writer) {
      throw new Error('Writer not initialized');
    }

    const stream = await this.writer.writeStreaming(prompt);

    for await (const chunk of stream) {
      onChunk(chunk);
    }
  }

  async destroy(): Promise<void> {
    if (this.writer && typeof this.writer.destroy === 'function') {
      await this.writer.destroy();
      this.writer = null;
    }
  }
}

export async function generateLetter(input: LetterInput): Promise<string> {
  const writer = new LetterWriter();

  try {
    await writer.initialize({ tone: 'formal', length: 'medium' });

    const positionText = {
      support: 'I am writing to express my strong support for',
      oppose: 'I am writing to express my opposition to',
      concerned: 'I am writing to share my concerns about',
    }[input.position];

    const prompt = `Write a professional letter to ${input.recipientTitle} ${input.recipientName} about "${input.billTitle}".

Position: ${positionText} this legislation.

${input.personalStory ? `Personal Context: ${input.personalStory}` : ''}

Key Points to Address:
${input.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

The letter should be respectful, persuasive, and clearly articulate the constituent's position.`;

    const letter = await writer.write(prompt);
    return letter;
  } finally {
    await writer.destroy();
  }
}
```

## 4. Rewriter API Implementation

```typescript
// lib/ai/rewriter.ts

export type RewriteTone = 'as-is' | 'more-formal' | 'more-casual';
export type RewriteLength = 'as-is' | 'shorter' | 'longer';

export interface RewriteOptions {
  tone?: RewriteTone;
  length?: RewriteLength;
  sharedContext?: string;
}

export class ContentRewriter {
  private rewriter: any = null;

  async initialize(options: RewriteOptions = {}): Promise<void> {
    if (!('ai' in window) || !('rewriter' in window.ai)) {
      throw new Error('Rewriter API not available');
    }

    this.rewriter = await window.ai.rewriter.create({
      tone: options.tone || 'as-is',
      length: options.length || 'as-is',
      sharedContext: options.sharedContext,
    });
  }

  async rewrite(text: string): Promise<string> {
    if (!this.rewriter) {
      throw new Error('Rewriter not initialized');
    }

    try {
      const rewritten = await this.rewriter.rewrite(text);
      return rewritten;
    } catch (error) {
      console.error('Rewriting error:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.rewriter && typeof this.rewriter.destroy === 'function') {
      await this.rewriter.destroy();
      this.rewriter = null;
    }
  }
}

export async function simplifyLegalText(text: string): Promise<string> {
  const rewriter = new ContentRewriter();

  try {
    await rewriter.initialize({
      tone: 'more-casual',
      sharedContext: 'Simplify legal and legislative language for general audience',
    });

    return await rewriter.rewrite(text);
  } finally {
    await rewriter.destroy();
  }
}
```

## 5. Proofreader API Implementation

```typescript
// lib/ai/proofreader.ts

export interface ProofreadingResult {
  correctedText: string;
  suggestions: ProofreadingSuggestion[];
}

export interface ProofreadingSuggestion {
  original: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'style';
  position: number;
}

export class LetterProofreader {
  private proofreader: any = null;

  async initialize(): Promise<void> {
    if (!('ai' in window) || !('proofreader' in window.ai)) {
      throw new Error('Proofreader API not available');
    }

    this.proofreader = await window.ai.proofreader.create();
  }

  async proofread(text: string): Promise<string> {
    if (!this.proofreader) {
      throw new Error('Proofreader not initialized');
    }

    try {
      const corrected = await this.proofreader.proofread(text);
      return corrected;
    } catch (error) {
      console.error('Proofreading error:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (this.proofreader && typeof this.proofreader.destroy === 'function') {
      await this.proofreader.destroy();
      this.proofreader = null;
    }
  }
}

export async function proofreadLetter(letter: string): Promise<string> {
  const proofreader = new LetterProofreader();

  try {
    await proofreader.initialize();
    return await proofreader.proofread(letter);
  } finally {
    await proofreader.destroy();
  }
}
```

## Error Handling & Fallbacks

```typescript
// lib/ai/fallbacks.ts

export class AIError extends Error {
  constructor(
    message: string,
    public apiName: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export async function withFallback<T>(
  apiCall: () => Promise<T>,
  fallback: T | (() => T),
  apiName: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${apiName} API error, using fallback:`, error);

    if (typeof fallback === 'function') {
      return (fallback as () => T)();
    }

    return fallback;
  }
}

// Example usage
export async function getSummaryWithFallback(
  billText: string
): Promise<string> {
  return withFallback(
    () => summarizeBill(billText).then(s => s.summary),
    'Summary not available. Please read the full bill text.',
    'Summarizer'
  );
}
```

## React Hooks for AI Integration

```typescript
// hooks/useAI.ts

import { useState, useEffect, useCallback } from 'react';
import { checkAIAvailability, AIAvailability } from '@/lib/ai/availability';

export function useAIAvailability() {
  const [availability, setAvailability] = useState<AIAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAIAvailability()
      .then(setAvailability)
      .finally(() => setLoading(false));
  }, []);

  return { availability, loading };
}

export function useBillSummarizer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const summarize = useCallback(async (
    billText: string,
    options?: SummarizerOptions
  ): Promise<BillSummary | null> => {
    setLoading(true);
    setError(null);

    try {
      const summary = await summarizeBill(billText, options);
      return summary;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { summarize, loading, error };
}

export function useLetterWriter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const write = useCallback(async (
    input: LetterInput
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const letter = await generateLetter(input);
      return letter;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { write, loading, error };
}
```

## Best Practices

### 1. Resource Management
- Always destroy sessions when done
- Use try/finally blocks to ensure cleanup
- Implement pooling for frequent operations

### 2. Performance
- Cache results aggressively
- Use streaming for long responses
- Limit context length to avoid slowdowns

### 3. User Experience
- Show loading states during AI processing
- Provide progress indicators for model downloads
- Offer fallbacks when APIs unavailable

### 4. Privacy
- Process sensitive data locally
- Never send personal information to external APIs
- Clear AI sessions after use

### 5. Error Handling
- Gracefully degrade when APIs unavailable
- Provide meaningful error messages
- Log errors for debugging

## Testing AI Integration

```typescript
// __tests__/ai/summarizer.test.ts

describe('BillSummarizer', () => {
  it('should generate summary when API available', async () => {
    // Mock the AI API
    global.window.ai = {
      summarizer: {
        availability: jest.fn().mockResolvedValue('readily'),
        create: jest.fn().mockResolvedValue({
          summarize: jest.fn().mockResolvedValue('Test summary'),
          destroy: jest.fn(),
        }),
      },
    };

    const summary = await summarizeBill('Test bill text');
    expect(summary.summary).toBe('Test summary');
  });

  it('should handle unavailable API', async () => {
    global.window.ai = undefined;

    await expect(summarizeBill('Test bill text')).rejects.toThrow();
  });
});
```
