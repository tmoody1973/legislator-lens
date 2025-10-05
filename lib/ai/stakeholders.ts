// Stakeholder Perspective Generation using Chrome Prompt API
// Analyzes bills from different stakeholder viewpoints

import { LegislativeAnalyzer, parseAIJsonResponse } from './prompt';

export interface StakeholderPerspective {
  stakeholderGroup: string;
  position: 'strongly support' | 'support' | 'neutral' | 'oppose' | 'strongly oppose';
  reasoning: string;
  keyBenefits: string[];
  keyConcerns: string[];
  likelyActions: string[];
  quotes?: string[]; // Simulated representative quotes
}

export interface StakeholderAnalysis {
  perspectives: StakeholderPerspective[];
  consensusAreas: string[];
  controversialAreas: string[];
  generatedAt: Date;
}

/**
 * Generate stakeholder perspectives for a bill
 */
export async function generateStakeholderPerspectives(
  billTitle: string,
  billSummary: string,
  provisions: string[],
  signal?: AbortSignal
): Promise<StakeholderAnalysis> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const prompt = `Analyze this bill from multiple stakeholder perspectives.

Bill Title: ${billTitle}
Summary: ${billSummary}
Key Provisions:
${provisions.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Identify 5-8 key stakeholder groups and analyze their likely positions.

Return ONLY a JSON object with this structure:
{
  "perspectives": [
    {
      "stakeholderGroup": "Group name (e.g., 'Small Business Owners', 'Healthcare Workers')",
      "position": "strongly support" | "support" | "neutral" | "oppose" | "strongly oppose",
      "reasoning": "Why they hold this position",
      "keyBenefits": ["benefit1", "benefit2"],
      "keyConcerns": ["concern1", "concern2"],
      "likelyActions": ["action1", "action2"],
      "quotes": ["Simulated quote expressing view"]
    }
  ],
  "consensusAreas": ["Area where most stakeholders agree"],
  "controversialAreas": ["Area of significant disagreement"]
}

Guidelines:
- Include diverse perspectives (economic, social, environmental, etc.)
- Be balanced and fair to each viewpoint
- Ground analysis in the actual bill provisions
- Include both powerful and less represented voices
- Make quotes realistic but clearly simulated`;

    const response = await analyzer.prompt(prompt, signal);
    const result = parseAIJsonResponse<{
      perspectives: StakeholderPerspective[];
      consensusAreas: string[];
      controversialAreas: string[];
    }>(response);

    if (!result.perspectives || !Array.isArray(result.perspectives)) {
      throw new Error('Invalid stakeholder analysis response');
    }

    return {
      perspectives: result.perspectives,
      consensusAreas: result.consensusAreas || [],
      controversialAreas: result.controversialAreas || [],
      generatedAt: new Date(),
    };
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Generate detailed testimony for a specific stakeholder
 */
export interface StakeholderTestimony {
  stakeholderGroup: string;
  representative: string; // Simulated name and title
  openingStatement: string;
  keyPoints: Array<{ point: string; explanation: string }>;
  closingStatement: string;
  callToAction: string;
}

export async function generateTestimony(
  billTitle: string,
  billSummary: string,
  stakeholderGroup: string,
  position: 'support' | 'oppose',
  signal?: AbortSignal
): Promise<StakeholderTestimony> {
  const analyzer = new LegislativeAnalyzer(`You are helping simulate realistic congressional testimony.
Generate authentic-sounding testimony that reflects real stakeholder concerns.
Make it professional, well-structured, and grounded in the bill's actual provisions.`);

  try {
    await analyzer.initialize();

    const prompt = `Generate simulated congressional testimony for this bill.

Bill Title: ${billTitle}
Summary: ${billSummary}

Stakeholder Group: ${stakeholderGroup}
Position: ${position}

Return ONLY a JSON object:
{
  "stakeholderGroup": "${stakeholderGroup}",
  "representative": "Simulated name and title",
  "openingStatement": "2-3 sentence opening",
  "keyPoints": [
    {
      "point": "Main point title",
      "explanation": "Detailed explanation with specific examples"
    }
  ],
  "closingStatement": "2-3 sentence closing",
  "callToAction": "What the stakeholder asks Congress to do"
}

Make it:
- Professional and respectful
- Specific to the bill's provisions
- Include concrete examples and data
- Reflect real concerns of this group
- 3-5 key points`;

    const response = await analyzer.prompt(prompt, signal);
    const testimony = parseAIJsonResponse<StakeholderTestimony>(response);

    return testimony;
  } finally {
    await analyzer.destroy();
  }
}

/**
 * Analyze potential coalitions and opposition
 */
export interface CoalitionAnalysis {
  supportCoalitions: Array<{
    name: string;
    members: string[];
    sharedInterests: string[];
    strength: 'weak' | 'moderate' | 'strong';
  }>;
  oppositionCoalitions: Array<{
    name: string;
    members: string[];
    sharedConcerns: string[];
    strength: 'weak' | 'moderate' | 'strong';
  }>;
  potentialCompromises: string[];
}

export async function analyzeCoalitions(
  perspectives: StakeholderPerspective[],
  signal?: AbortSignal
): Promise<CoalitionAnalysis> {
  const analyzer = new LegislativeAnalyzer();

  try {
    await analyzer.initialize();

    const perspectivesData = perspectives.map(p => ({
      group: p.stakeholderGroup,
      position: p.position,
      benefits: p.keyBenefits,
      concerns: p.keyConcerns,
    }));

    const prompt = `Analyze these stakeholder perspectives and identify potential coalitions.

Stakeholder Perspectives:
${JSON.stringify(perspectivesData, null, 2)}

Return ONLY a JSON object:
{
  "supportCoalitions": [
    {
      "name": "Coalition name",
      "members": ["group1", "group2"],
      "sharedInterests": ["interest1", "interest2"],
      "strength": "weak" | "moderate" | "strong"
    }
  ],
  "oppositionCoalitions": [
    {
      "name": "Coalition name",
      "members": ["group1", "group2"],
      "sharedConcerns": ["concern1", "concern2"],
      "strength": "weak" | "moderate" | "strong"
    }
  ],
  "potentialCompromises": ["Possible compromise 1", "Possible compromise 2"]
}

Identify:
- Natural alliances based on shared interests
- Opposition groups with aligned concerns
- Possible amendments that could build support`;

    const response = await analyzer.prompt(prompt, signal);
    const analysis = parseAIJsonResponse<CoalitionAnalysis>(response);

    return analysis;
  } finally {
    await analyzer.destroy();
  }
}
