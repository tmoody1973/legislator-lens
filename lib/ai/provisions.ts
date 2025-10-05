// Key Provision Extraction using Chrome Prompt API
// Analyzes bill text to extract and explain key provisions

import { LegislativeAnalyzer, parseAIJsonResponse } from './prompt';

export interface Provision {
  title: string;
  description: string;
  impact: string;
  stakeholders: string[];
  section?: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProvisionAnalysis {
  provisions: Provision[];
  totalProvisions: number;
  keyThemes: string[];
  generatedAt: Date;
}

/**
 * Extract key provisions from bill text
 */
export async function extractKeyProvisions(
  billText: string,
  maxProvisions: number = 5,
  signal?: AbortSignal
): Promise<ProvisionAnalysis> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    // Limit bill text to avoid token limits (take beginning and end sections)
    const textLength = billText.length;
    const sampleSize = 8000;
    const billSample = textLength > sampleSize * 2
      ? billText.substring(0, sampleSize) + '\n\n[... middle sections omitted ...]\n\n' + billText.substring(textLength - sampleSize)
      : billText;

    const prompt = `Analyze this bill and extract the ${maxProvisions} most important provisions.

For each provision, explain:
1. What it does (clear, plain language)
2. Who it affects (specific groups and stakeholders)
3. Potential impact (positive, negative, or neutral consequences)
4. Section reference if available
5. Importance level

Bill Text:
${billSample}

Return ONLY a valid JSON object with this structure:
{
  "provisions": [
    {
      "title": "Provision Title",
      "description": "What this provision does in plain language",
      "impact": "Potential effects and consequences",
      "stakeholders": ["Group 1", "Group 2", "Group 3"],
      "section": "Section number or identifier",
      "importance": "low" | "medium" | "high" | "critical"
    }
  ],
  "keyThemes": ["theme1", "theme2", "theme3"]
}

Guidelines:
- Focus on provisions that significantly affect people's lives
- Use plain language, avoid legal jargon
- Be specific about impacts (numbers, timeframes, requirements)
- Include both direct and indirect stakeholders
- Order by importance (most critical first)`;

    const response = await analyzer.prompt(prompt, signal);
    const result = parseAIJsonResponse<{
      provisions: Provision[];
      keyThemes: string[];
    }>(response);

    if (!result.provisions || !Array.isArray(result.provisions)) {
      throw new Error('Invalid provisions response: expected provisions array');
    }

    return {
      provisions: result.provisions.slice(0, maxProvisions),
      totalProvisions: result.provisions.length,
      keyThemes: result.keyThemes || [],
      generatedAt: new Date(),
    };
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Analyze a specific provision in detail
 */
export interface DetailedProvision extends Provision {
  legalLanguage: string;
  plainLanguageExplanation: string;
  examples: string[];
  concerns: string[];
  benefits: string[];
  tradeoffs: string[];
}

export async function analyzeProvisionDetail(
  provisionText: string,
  billContext: string,
  signal?: AbortSignal
): Promise<DetailedProvision> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Provide a detailed analysis of this specific bill provision.

Provision Text:
${provisionText}

Context (from larger bill):
${billContext.substring(0, 2000)}

Return ONLY a JSON object with this structure:
{
  "title": "Provision Title",
  "description": "What this does",
  "impact": "Overall impact summary",
  "stakeholders": ["group1", "group2"],
  "section": "Section reference",
  "importance": "low" | "medium" | "high" | "critical",
  "legalLanguage": "The actual legal text",
  "plainLanguageExplanation": "Explanation in everyday language",
  "examples": ["Real-world example 1", "Real-world example 2"],
  "concerns": ["Potential concern 1", "Potential concern 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "tradeoffs": ["Tradeoff 1", "Tradeoff 2"]
}

Provide:
- Clear examples of how this would work in practice
- Potential concerns or unintended consequences
- Benefits to different groups
- Tradeoffs or competing interests`;

    const response = await analyzer.prompt(prompt, signal);
    const detailed = parseAIJsonResponse<DetailedProvision>(response);

    return detailed;
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Compare provisions across multiple bills
 */
export interface ProvisionComparison {
  commonThemes: string[];
  uniqueProvisions: { billId: string; provisions: Provision[] }[];
  conflictingProvisions: { description: string; bills: string[] }[];
  complementaryProvisions: { description: string; bills: string[] }[];
}

export async function compareProvisions(
  bills: Array<{ id: string; title: string; provisions: Provision[] }>,
  signal?: AbortSignal
): Promise<ProvisionComparison> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const billsData = bills.map(b => ({
      id: b.id,
      title: b.title,
      provisions: b.provisions.map(p => ({
        title: p.title,
        description: p.description,
        stakeholders: p.stakeholders,
      })),
    }));

    const prompt = `Compare provisions across these bills and identify:
1. Common themes and overlapping areas
2. Unique provisions in each bill
3. Conflicting or contradictory provisions
4. Complementary provisions that work together

Bills:
${JSON.stringify(billsData, null, 2)}

Return ONLY a JSON object with this structure:
{
  "commonThemes": ["theme1", "theme2"],
  "uniqueProvisions": [
    { "billId": "bill-1", "provisions": [{ "title": "...", "description": "..." }] }
  ],
  "conflictingProvisions": [
    { "description": "How they conflict", "bills": ["bill-1", "bill-2"] }
  ],
  "complementaryProvisions": [
    { "description": "How they work together", "bills": ["bill-1", "bill-2"] }
  ]
}`;

    const response = await analyzer.prompt(prompt, signal);
    const comparison = parseAIJsonResponse<ProvisionComparison>(response);

    return comparison;
  } finally {
    await analyzer.destroy();
  }
}
