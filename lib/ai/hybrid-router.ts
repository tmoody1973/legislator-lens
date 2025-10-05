// Hybrid AI Router
// Intelligently routes between Chrome AI (on-device) and Cloud AI based on task requirements

import { summarizeBill, generateMultipleSummaries, type SummaryType } from './summarizer';
import { categorizeBill, classifyBillUrgency } from './categorization';
import { extractKeyProvisions } from './provisions';
import { generateStakeholderPerspectives } from './stakeholders';
import { BillQASession } from './qa';

import {
  analyzeHistoricalBills,
  analyzeBillImpact,
  compareBills,
  type HistoricalBillAnalysis,
  type BillImpactAnalysis,
} from '../cloud-ai/gemini';

import {
  correlateBillWithNews,
  findRelatedNews,
  type NewsCorrelation,
  type NewsArticle,
} from '../cloud-ai/news';

export type AIProvider = 'chrome' | 'gemini' | 'news' | 'hybrid';

export interface HybridAnalysisOptions {
  // Core analysis (always done with Chrome AI)
  includeSummary?: boolean;
  includeCategories?: boolean;
  includeProvisions?: boolean;
  includeStakeholders?: boolean;

  // Enhanced features (require Cloud AI)
  includeHistoricalAnalysis?: boolean; // Gemini
  includeImpactAnalysis?: boolean; // Gemini
  includeNews?: boolean; // NewsAPI/Guardian

  // Control
  offlineMode?: boolean; // Force Chrome AI only
  signal?: AbortSignal;
}

export interface ComprehensiveBillAnalysis {
  // Chrome AI results (fast, private, always included)
  core: {
    summary?: {
      'key-points': string;
      'tl;dr': string;
      teaser: string;
    };
    categories?: Array<{
      name: string;
      confidence: number;
      description: string;
    }>;
    urgency?: {
      urgency: 'low' | 'medium' | 'high' | 'critical';
      impactLevel: 'narrow' | 'moderate' | 'broad' | 'sweeping';
    };
    provisions?: Array<{
      title: string;
      description: string;
      impact: string;
      stakeholders: string[];
    }>;
    stakeholderPerspectives?: Array<{
      stakeholderGroup: string;
      position: string;
      reasoning: string;
    }>;
  };

  // Cloud AI results (optional, requires API keys)
  enhanced?: {
    historicalAnalysis?: HistoricalBillAnalysis;
    impactAnalysis?: BillImpactAnalysis;
    newsCorrelation?: NewsCorrelation;
  };

  // Metadata
  providers: {
    chrome: boolean;
    gemini: boolean;
    news: boolean;
  };
  generatedAt: Date;
  processingTime: {
    chrome: number; // ms
    cloud: number; // ms
    total: number; // ms
  };
}

/**
 * Perform comprehensive bill analysis using hybrid AI
 */
export async function analyzeBillWithHybridAI(
  billTitle: string,
  billSummary: string,
  billText: string,
  billIntroducedDate?: Date,
  options: HybridAnalysisOptions = {}
): Promise<ComprehensiveBillAnalysis> {
  const startTime = Date.now();
  let chromeTime = 0;
  let cloudTime = 0;

  const analysis: ComprehensiveBillAnalysis = {
    core: {},
    providers: {
      chrome: false,
      gemini: false,
      news: false,
    },
    generatedAt: new Date(),
    processingTime: {
      chrome: 0,
      cloud: 0,
      total: 0,
    },
  };

  // Phase 1: Chrome AI (Fast, Private, Core Experience)
  const chromeStart = Date.now();

  if (options.includeSummary !== false) {
    try {
      const summaries = await generateMultipleSummaries(
        billText,
        ['key-points', 'tl;dr', 'teaser'] as SummaryType[],
        options.signal
      );
      analysis.core.summary = {
        'key-points': summaries['key-points'].summary,
        'tl;dr': summaries['tl;dr'].summary,
        teaser: summaries.teaser.summary,
      };
      analysis.providers.chrome = true;
    } catch (error) {
      console.error('Chrome Summarizer error:', error);
    }
  }

  if (options.includeCategories !== false) {
    try {
      const categorization = await categorizeBill(billTitle, billSummary, options.signal);
      analysis.core.categories = categorization.categories;

      const urgency = await classifyBillUrgency(billTitle, billSummary, options.signal);
      analysis.core.urgency = urgency;

      analysis.providers.chrome = true;
    } catch (error) {
      console.error('Chrome Categorization error:', error);
    }
  }

  if (options.includeProvisions !== false) {
    try {
      const provisionsResult = await extractKeyProvisions(billText, 5, options.signal);
      analysis.core.provisions = provisionsResult.provisions;
      analysis.providers.chrome = true;
    } catch (error) {
      console.error('Chrome Provisions error:', error);
    }
  }

  if (options.includeStakeholders !== false && analysis.core.provisions) {
    try {
      const provisionDescriptions = analysis.core.provisions.map((p) => p.description);
      const stakeholders = await generateStakeholderPerspectives(
        billTitle,
        billSummary,
        provisionDescriptions,
        options.signal
      );
      analysis.core.stakeholderPerspectives = stakeholders.perspectives;
      analysis.providers.chrome = true;
    } catch (error) {
      console.error('Chrome Stakeholder analysis error:', error);
    }
  }

  chromeTime = Date.now() - chromeStart;

  // Phase 2: Cloud AI (Advanced Features, Optional)
  if (!options.offlineMode) {
    const cloudStart = Date.now();
    analysis.enhanced = {};

    // Historical Analysis (Gemini)
    if (options.includeHistoricalAnalysis && analysis.core.provisions) {
      try {
        const provisionDescriptions = analysis.core.provisions.map((p) => p.description);
        const historical = await analyzeHistoricalBills(
          billTitle,
          billSummary,
          provisionDescriptions
        );
        analysis.enhanced.historicalAnalysis = historical;
        analysis.providers.gemini = true;
      } catch (error) {
        console.error('Gemini Historical Analysis error:', error);
      }
    }

    // Impact Analysis (Gemini)
    if (options.includeImpactAnalysis) {
      try {
        const impact = await analyzeBillImpact(billTitle, billSummary, billText);
        analysis.enhanced.impactAnalysis = impact;
        analysis.providers.gemini = true;
      } catch (error) {
        console.error('Gemini Impact Analysis error:', error);
      }
    }

    // News Correlation (NewsAPI/Guardian)
    if (options.includeNews && analysis.core.categories) {
      try {
        const keywords = analysis.core.categories
          .slice(0, 3)
          .flatMap((c) => c.tags || [c.name]);

        const newsCorrelation = await correlateBillWithNews(
          billTitle,
          billSummary,
          keywords,
          billIntroducedDate
        );
        analysis.enhanced.newsCorrelation = newsCorrelation;
        analysis.providers.news = true;
      } catch (error) {
        console.error('News Correlation error:', error);
      }
    }

    cloudTime = Date.now() - cloudStart;
  }

  // Calculate timing
  analysis.processingTime = {
    chrome: chromeTime,
    cloud: cloudTime,
    total: Date.now() - startTime,
  };

  return analysis;
}

/**
 * Quick analysis (Chrome AI only, no cloud)
 */
export async function quickBillAnalysis(
  billTitle: string,
  billSummary: string,
  billText: string,
  signal?: AbortSignal
): Promise<ComprehensiveBillAnalysis> {
  return analyzeB
illWithHybridAI(billTitle, billSummary, billText, undefined, {
    includeSummary: true,
    includeCategories: true,
    includeProvisions: true,
    includeStakeholders: false,
    offlineMode: true,
    signal,
  });
}

/**
 * Deep analysis (Chrome AI + all Cloud AI)
 */
export async function deepBillAnalysis(
  billTitle: string,
  billSummary: string,
  billText: string,
  billIntroducedDate?: Date,
  signal?: AbortSignal
): Promise<ComprehensiveBillAnalysis> {
  return analyzeBillWithHybridAI(billTitle, billSummary, billText, billIntroducedDate, {
    includeSummary: true,
    includeCategories: true,
    includeProvisions: true,
    includeStakeholders: true,
    includeHistoricalAnalysis: true,
    includeImpactAnalysis: true,
    includeNews: true,
    signal,
  });
}

/**
 * Check which AI providers are available
 */
export async function checkHybridAvailability(): Promise<{
  chrome: {
    summarizer: boolean;
    prompt: boolean;
    writer: boolean;
    rewriter: boolean;
    proofreader: boolean;
  };
  cloud: {
    gemini: boolean;
    newsapi: boolean;
    guardian: boolean;
  };
}> {
  // Check Chrome AI (Chrome 138+ stable API)
  const chromeAvailable = {
    summarizer: false,
    prompt: false,
    writer: false,
    rewriter: false,
    proofreader: false,
  };

  // Check Summarizer API
  if ('Summarizer' in self) {
    try {
      const availability = await (self as any).Summarizer.availability();
      chromeAvailable.summarizer = availability === 'available';
    } catch (e) {
      /* ignore */
    }
  }

  // Check LanguageModel API (Prompt API)
  if ('LanguageModel' in self) {
    try {
      const availability = await (self as any).LanguageModel.availability();
      chromeAvailable.prompt = availability === 'available';
    } catch (e) {
      /* ignore */
    }
  }

  // Check Writer API
  if ('Writer' in self) {
    try {
      const availability = await (self as any).Writer.availability();
      chromeAvailable.writer = availability === 'available';
    } catch (e) {
      /* ignore */
    }
  }

  // Check Rewriter API
  if ('Rewriter' in self) {
    try {
      const availability = await (self as any).Rewriter.availability();
      chromeAvailable.rewriter = availability === 'available';
    } catch (e) {
      /* ignore */
    }
  }

  // Check Proofreader API (if available in future)
  if ('Proofreader' in self) {
    try {
      const availability = await (self as any).Proofreader.availability();
      chromeAvailable.proofreader = availability === 'available';
    } catch (e) {
      /* ignore */
    }
  }

  // Check Cloud AI
  const cloudAvailable = {
    gemini: !!(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY),
    newsapi: !!(process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY),
    guardian: !!(process.env.GUARDIAN_API_KEY || process.env.NEXT_PUBLIC_GUARDIAN_API_KEY),
  };

  return {
    chrome: chromeAvailable,
    cloud: cloudAvailable,
  };
}

/**
 * Get recommended analysis level based on available APIs
 */
export async function getRecommendedAnalysisLevel(): Promise<{
  level: 'quick' | 'standard' | 'deep';
  reason: string;
  availableFeatures: string[];
}> {
  const availability = await checkHybridAvailability();

  const chromeCount = Object.values(availability.chrome).filter(Boolean).length;
  const cloudCount = Object.values(availability.cloud).filter(Boolean).length;

  const features: string[] = [];

  if (availability.chrome.summarizer) features.push('Bill Summaries');
  if (availability.chrome.prompt) features.push('Categorization & Analysis');
  if (availability.chrome.writer) features.push('Letter Writing');
  if (availability.cloud.gemini) features.push('Historical Analysis');
  if (availability.cloud.newsapi || availability.cloud.guardian) features.push('News Correlation');

  if (chromeCount >= 2 && cloudCount >= 2) {
    return {
      level: 'deep',
      reason: 'Both Chrome AI and Cloud AI are available for comprehensive analysis',
      availableFeatures: features,
    };
  }

  if (chromeCount >= 2) {
    return {
      level: 'standard',
      reason: 'Chrome AI is available for core analysis',
      availableFeatures: features,
    };
  }

  return {
    level: 'quick',
    reason: 'Limited AI capabilities available',
    availableFeatures: features,
  };
}
