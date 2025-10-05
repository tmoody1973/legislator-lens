// Bill Categorization using Chrome Prompt API
// Generates contextual categories for bills based on content and current events

import { LegislativeAnalyzer, parseAIJsonResponse } from './prompt';

export interface BillCategory {
  name: string;
  confidence: number;
  description: string;
  tags?: string[];
}

export interface CategorizationResult {
  categories: BillCategory[];
  primaryCategory: BillCategory;
  secondaryCategories: BillCategory[];
  generatedAt: Date;
}

/**
 * Categorize a bill based on its title and summary
 */
export async function categorizeBill(
  billTitle: string,
  billSummary: string,
  signal?: AbortSignal
): Promise<CategorizationResult> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Analyze this congressional bill and suggest 3-5 contextual categories.
Consider:
- Current events and policy debates
- Policy areas affected (healthcare, education, economy, etc.)
- Stakeholder groups impacted
- Historical context and precedents
- Urgency and relevance

Bill Title: ${billTitle}
Summary: ${billSummary}

Return ONLY a valid JSON array of categories with this exact structure:
[
  {
    "name": "Category Name",
    "confidence": 0.95,
    "description": "Brief explanation of why this category applies",
    "tags": ["tag1", "tag2"]
  }
]

Guidelines:
- Categories should be specific and meaningful (e.g., "Post-Pandemic Recovery", "Climate Resilience", "Digital Privacy Rights")
- Confidence should be between 0 and 1
- Include 2-4 relevant tags per category
- Order by confidence (highest first)
- Focus on practical, searchable categories that help citizens find relevant bills`;

    const response = await analyzer.prompt(prompt, signal);
    const categories = parseAIJsonResponse<BillCategory[]>(response);

    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('Invalid categorization response: expected array of categories');
    }

    // Sort by confidence
    const sortedCategories = categories.sort((a, b) => b.confidence - a.confidence);

    return {
      categories: sortedCategories,
      primaryCategory: sortedCategories[0],
      secondaryCategories: sortedCategories.slice(1),
      generatedAt: new Date(),
    };
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Generate category suggestions based on partial bill text
 */
export async function suggestCategories(
  billText: string,
  maxSuggestions: number = 10,
  signal?: AbortSignal
): Promise<string[]> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Based on this bill excerpt, suggest ${maxSuggestions} category names that citizens might use to search for similar legislation.

Bill Text:
${billText.substring(0, 3000)}

Return ONLY a JSON array of category name strings:
["Category 1", "Category 2", ...]

Make categories:
- Searchable and intuitive
- Specific but not too technical
- Focused on impacts and policy areas
- Diverse (covering different aspects of the bill)`;

    const response = await analyzer.prompt(prompt, signal);
    const suggestions = parseAIJsonResponse<string[]>(response);

    if (!Array.isArray(suggestions)) {
      throw new Error('Invalid suggestion response: expected array of strings');
    }

    return suggestions.slice(0, maxSuggestions);
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Classify bill urgency and impact level
 */
export interface BillClassification {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  impactLevel: 'narrow' | 'moderate' | 'broad' | 'sweeping';
  reasoning: string;
  affectedPopulation: string;
  timelineConcerns: string[];
}

export async function classifyBillUrgency(
  billTitle: string,
  billSummary: string,
  signal?: AbortSignal
): Promise<BillClassification> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Classify this bill's urgency and impact level.

Bill Title: ${billTitle}
Summary: ${billSummary}

Return ONLY a JSON object with this structure:
{
  "urgency": "low" | "medium" | "high" | "critical",
  "impactLevel": "narrow" | "moderate" | "broad" | "sweeping",
  "reasoning": "Explanation of urgency and impact assessment",
  "affectedPopulation": "Description of who is affected",
  "timelineConcerns": ["concern1", "concern2"]
}

Urgency Definitions:
- low: Routine legislation, no time pressure
- medium: Important but not time-sensitive
- high: Significant impact with approaching deadlines
- critical: Urgent action needed, immediate consequences

Impact Level Definitions:
- narrow: Affects specific group or sector
- moderate: Affects multiple sectors or large demographic
- broad: National impact across many areas
- sweeping: Fundamental changes to major systems`;

    const response = await analyzer.prompt(prompt, signal);
    const classification = parseAIJsonResponse<BillClassification>(response);

    return classification;
  } finally {
    await analyzer.destroy();
  }
}
