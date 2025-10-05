// Google Gemini API Integration
// Cloud AI for advanced bill analysis and historical comparisons

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: 'gemini-pro' | 'gemini-pro-vision';
  temperature?: number;
  maxOutputTokens?: number;
}

export interface HistoricalBillAnalysis {
  similarBills: Array<{
    title: string;
    congress: number;
    year: number;
    similarity: string;
    outcome: string;
    keyDifferences: string[];
  }>;
  trends: string[];
  recommendations: string[];
  historicalContext: string;
}

export interface BillImpactAnalysis {
  economicImpact: {
    summary: string;
    affected: string[];
    estimated: string;
  };
  socialImpact: {
    summary: string;
    communities: string[];
    timeframe: string;
  };
  politicalContext: {
    summary: string;
    coalitions: string[];
    obstacles: string[];
  };
}

/**
 * Initialize Gemini AI client
 */
function getGeminiClient(config?: Partial<GeminiConfig>) {
  const apiKey = config?.apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY environment variable.');
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate content with Gemini
 */
export async function generateWithGemini(
  prompt: string,
  config?: Partial<GeminiConfig>
): Promise<string> {
  const genAI = getGeminiClient(config);
  const model = genAI.getGenerativeModel({
    model: config?.model || 'gemini-2.0-flash',
    generationConfig: {
      temperature: config?.temperature || 0.7,
      maxOutputTokens: config?.maxOutputTokens || 2048,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Analyze historical bills similar to current one
 */
export async function analyzeHistoricalBills(
  billTitle: string,
  billSummary: string,
  billProvisions: string[]
): Promise<HistoricalBillAnalysis> {
  const prompt = `You are a legislative historian analyzing congressional bills.

Current Bill: "${billTitle}"
Summary: ${billSummary}

Key Provisions:
${billProvisions.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Task: Find and analyze similar bills from U.S. Congress history (focus on last 10-15 years).

Return ONLY a JSON object with this structure:
{
  "similarBills": [
    {
      "title": "Bill title",
      "congress": 117,
      "year": 2021,
      "similarity": "Why this bill is similar",
      "outcome": "What happened to this bill (passed, failed, amended, etc.)",
      "keyDifferences": ["Difference 1", "Difference 2"]
    }
  ],
  "trends": ["Trend 1", "Trend 2", "Trend 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "historicalContext": "Brief historical context about this type of legislation"
}

Guidelines:
- Find 3-5 similar bills if possible
- Focus on bills with similar provisions or goals
- Include both successful and unsuccessful bills
- Note any trends in how such legislation is treated
- Provide actionable recommendations based on history`;

  const response = await generateWithGemini(prompt, {
    temperature: 0.3, // Lower for more factual, structured responses
    maxOutputTokens: 3000,
  });

  // Clean response - remove markdown code blocks if present
  let cleanedResponse = response.trim();
  cleanedResponse = cleanedResponse.replace(/```json\n?/g, '');
  cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
  cleanedResponse = cleanedResponse.trim();

  // Parse JSON response
  const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Gemini response:', cleanedResponse);
    throw new Error('Invalid response format from Gemini - no JSON found');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Attempted to parse:', jsonMatch[0].substring(0, 500));
    throw new Error(`Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }
}

/**
 * Perform deep bill impact analysis
 */
export async function analyzeBillImpact(
  billTitle: string,
  billSummary: string,
  billText: string
): Promise<BillImpactAnalysis> {
  const textSample = billText.substring(0, 8000); // Limit for token management

  const prompt = `Analyze the potential impacts of this congressional bill.

Bill: "${billTitle}"
Summary: ${billSummary}

Bill Text (excerpt):
${textSample}

Return ONLY a JSON object with this structure:
{
  "economicImpact": {
    "summary": "Overall economic impact summary",
    "affectedSectors": ["Sector 1", "Sector 2"],
    "estimatedCost": "Cost estimate or range"
  },
  "socialImpact": {
    "summary": "Social impact summary",
    "affectedCommunities": ["Community 1", "Community 2"],
    "timeframe": "When impacts would be felt"
  },
  "politicalContext": {
    "summary": "Political context and feasibility",
    "likelyCoalitions": ["Coalition 1", "Coalition 2"],
    "potentialObstacles": ["Obstacle 1", "Obstacle 2"]
  }
}

Provide realistic, evidence-based analysis.`;

  const response = await generateWithGemini(prompt, {
    temperature: 0.6,
    maxOutputTokens: 2500,
  });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Compare multiple bills side-by-side
 */
export async function compareBills(
  bills: Array<{
    title: string;
    summary: string;
    provisions: string[];
  }>
): Promise<{
  commonThemes: string[];
  uniqueElements: Array<{ billTitle: string; elements: string[] }>;
  conflicts: Array<{ description: string; bills: string[] }>;
  synergies: Array<{ description: string; bills: string[] }>;
  recommendation: string;
}> {
  const billsData = bills.map((b, i) => `
Bill ${i + 1}: "${b.title}"
Summary: ${b.summary}
Provisions: ${b.provisions.join('; ')}
`).join('\n---\n');

  const prompt = `Compare these congressional bills and identify relationships between them.

${billsData}

Return ONLY a JSON object:
{
  "commonThemes": ["Theme 1", "Theme 2"],
  "uniqueElements": [
    { "billTitle": "Bill title", "elements": ["Element 1", "Element 2"] }
  ],
  "conflicts": [
    { "description": "How bills conflict", "bills": ["Bill 1", "Bill 2"] }
  ],
  "synergies": [
    { "description": "How bills complement each other", "bills": ["Bill 1", "Bill 2"] }
  ],
  "recommendation": "Overall recommendation about these bills"
}`;

  const response = await generateWithGemini(prompt, {
    temperature: 0.5,
    maxOutputTokens: 3000,
  });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Generate explanations for complex legislative concepts
 */
export async function explainLegislativeConcept(
  concept: string,
  context?: string
): Promise<{
  simpleExplanation: string;
  detailedExplanation: string;
  examples: string[];
  relatedConcepts: string[];
}> {
  const contextClause = context ? `\n\nContext: ${context}` : '';

  const prompt = `Explain this legislative concept in a way that helps citizens understand it.

Concept: "${concept}"${contextClause}

Return ONLY a JSON object:
{
  "simpleExplanation": "One sentence explanation for 5th grader",
  "detailedExplanation": "Comprehensive explanation with specifics",
  "examples": ["Real-world example 1", "Real-world example 2"],
  "relatedConcepts": ["Related concept 1", "Related concept 2"]
}`;

  const response = await generateWithGemini(prompt, {
    temperature: 0.7,
    maxOutputTokens: 2000,
  });

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Summarize bill text using Gemini (cloud fallback for Chrome AI)
 */
export async function summarizeBillWithGemini(
  billText: string,
  summaryType: 'key-points' | 'tl;dr' | 'teaser' | 'headline' = 'key-points'
): Promise<string> {
  const textSample = billText.substring(0, 10000); // Limit for token management

  const prompts = {
    'key-points': `Summarize this congressional bill as key points. Provide 3-5 bullet points covering the main provisions and impacts.

Bill Text:
${textSample}

Return ONLY the key points as a markdown list, nothing else.`,

    'tl;dr': `Provide a TL;DR (too long; didn't read) summary of this congressional bill in 2-3 sentences.

Bill Text:
${textSample}

Return ONLY the summary text, nothing else.`,

    teaser: `Write a one-paragraph teaser summary of this congressional bill that would make citizens want to learn more.

Bill Text:
${textSample}

Return ONLY the teaser paragraph, nothing else.`,

    headline: `Create a compelling headline (10-15 words) that captures the essence of this congressional bill.

Bill Text:
${textSample}

Return ONLY the headline, nothing else.`,
  };

  const response = await generateWithGemini(prompts[summaryType], {
    temperature: 0.7,
    maxOutputTokens: summaryType === 'headline' ? 100 : 800,
  });

  return response.trim();
}

/**
 * Generate multiple bill summaries using Gemini
 */
export async function generateMultipleBillSummariesWithGemini(
  billText: string,
  summaryTypes: Array<'key-points' | 'tl;dr' | 'teaser' | 'headline'> = ['key-points', 'tl;dr']
): Promise<Record<string, { summary: string; type: string; format: string }>> {
  const summaries: Record<string, any> = {};

  for (const type of summaryTypes) {
    try {
      const summary = await summarizeBillWithGemini(billText, type);
      summaries[type] = {
        summary,
        type,
        format: type === 'key-points' ? 'markdown' : 'plain-text',
        generatedAt: new Date(),
        cached: false,
        source: 'gemini', // Cloud AI source
      };
    } catch (error) {
      console.error(`Error generating ${type} summary with Gemini:`, error);
      // Continue with other summaries even if one fails
    }
  }

  return summaries;
}

/**
 * Check Gemini API availability
 */
export async function checkGeminiAvailability(): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        available: false,
        error: 'API key not configured',
      };
    }

    // Test with a simple query
    await generateWithGemini('Test', { maxOutputTokens: 10 });

    return { available: true };
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
