// Chrome AI API type definitions

interface Window {
  ai?: {
    summarizer?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: SummarizerOptions): Promise<Summarizer>;
    };
    languageModel?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: LanguageModelOptions): Promise<LanguageModel>;
    };
    writer?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: WriterOptions): Promise<Writer>;
    };
    rewriter?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: RewriterOptions): Promise<Rewriter>;
    };
    proofreader?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(): Promise<Proofreader>;
    };
  };
}

interface SummarizerOptions {
  type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

interface Summarizer {
  summarize(text: string): Promise<string>;
  destroy(): Promise<void>;
}

interface LanguageModelOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
}

interface LanguageModel {
  prompt(message: string): Promise<string>;
  promptStreaming(message: string): AsyncIterable<string>;
  destroy(): Promise<void>;
}

interface WriterOptions {
  tone?: 'formal' | 'casual' | 'professional';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

interface Writer {
  write(prompt: string): Promise<string>;
  writeStreaming(prompt: string): AsyncIterable<string>;
  destroy(): Promise<void>;
}

interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  length?: 'as-is' | 'shorter' | 'longer';
  sharedContext?: string;
}

interface Rewriter {
  rewrite(text: string): Promise<string>;
  destroy(): Promise<void>;
}

interface Proofreader {
  proofread(text: string): Promise<string>;
  destroy(): Promise<void>;
}
