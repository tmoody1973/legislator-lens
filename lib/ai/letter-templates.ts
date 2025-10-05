// Letter Templates and Guided Writing Process
// Provides structured approach to letter writing with templates

import { LetterInput, generateLetter, GeneratedLetter } from './writer';

/**
 * Letter template types
 */
export type LetterTemplate =
  | 'support'
  | 'oppose'
  | 'request-information'
  | 'share-story'
  | 'request-meeting'
  | 'thank-you'
  | 'custom';

/**
 * Guided writing step
 */
export interface GuidedStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

/**
 * Guided letter writing state
 */
export interface GuidedLetterState {
  currentStep: number;
  steps: GuidedStep[];
  data: Partial<LetterInput>;
  template?: LetterTemplate;
}

/**
 * Initialize guided letter writing process
 */
export function initializeGuidedWriting(template?: LetterTemplate): GuidedLetterState {
  return {
    currentStep: 1,
    steps: [
      {
        step: 1,
        title: 'Select Position',
        description: 'Choose your stance on the bill',
        completed: false,
      },
      {
        step: 2,
        title: 'Share Your Story',
        description: 'Add personal context (optional but impactful)',
        completed: false,
      },
      {
        step: 3,
        title: 'Key Points',
        description: 'List main arguments or concerns',
        completed: false,
      },
      {
        step: 4,
        title: 'Customize Tone',
        description: 'Choose formality and length',
        completed: false,
      },
      {
        step: 5,
        title: 'Review & Send',
        description: 'Generate and review your letter',
        completed: false,
      },
    ],
    data: {},
    template,
  };
}

/**
 * Get template-specific guidance
 */
export function getTemplateGuidance(template: LetterTemplate): {
  title: string;
  description: string;
  suggestedPoints: string[];
  tone: 'formal' | 'neutral' | 'casual';
} {
  const templates = {
    support: {
      title: 'Letter of Support',
      description: 'Express your support for the bill and why you believe it should pass',
      suggestedPoints: [
        'Why this bill matters to you personally',
        'How it will benefit your community',
        'Addressing potential concerns about the bill',
        'Requesting the representative to vote in favor',
      ],
      tone: 'formal' as const,
    },
    oppose: {
      title: 'Letter of Opposition',
      description: 'Express concerns about the bill and suggest alternatives',
      suggestedPoints: [
        'Specific provisions you find problematic',
        'Potential negative impacts on your community',
        'Alternative approaches to consider',
        'Requesting the representative to vote against or amend',
      ],
      tone: 'formal' as const,
    },
    'request-information': {
      title: 'Request for Information',
      description: 'Ask your representative for clarification or information about the bill',
      suggestedPoints: [
        'Specific questions about bill provisions',
        'Request for the representative\'s position',
        'Ask about potential impacts',
        'Request for updates on bill status',
      ],
      tone: 'neutral' as const,
    },
    'share-story': {
      title: 'Personal Story',
      description: 'Share how this issue affects you personally',
      suggestedPoints: [
        'Your personal experience with this issue',
        'How the bill would change your situation',
        'What you hope the representative will do',
        'Offer to provide more details if helpful',
      ],
      tone: 'neutral' as const,
    },
    'request-meeting': {
      title: 'Meeting Request',
      description: 'Request a meeting to discuss the bill',
      suggestedPoints: [
        'Why you want to meet in person or virtually',
        'Brief overview of your concerns or support',
        'Suggested timeframes for meeting',
        'How you can be reached',
      ],
      tone: 'formal' as const,
    },
    'thank-you': {
      title: 'Thank You Letter',
      description: 'Thank your representative for their position or action',
      suggestedPoints: [
        'Specific action you\'re thanking them for',
        'Why their action matters to you',
        'How it impacts your community',
        'Encouragement to continue this approach',
      ],
      tone: 'formal' as const,
    },
    custom: {
      title: 'Custom Letter',
      description: 'Create your own letter structure',
      suggestedPoints: [
        'Main point 1',
        'Main point 2',
        'Main point 3',
      ],
      tone: 'neutral' as const,
    },
  };

  return templates[template] || templates.custom;
}

/**
 * Validate step completion
 */
export function validateStep(step: number, data: Partial<LetterInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  switch (step) {
    case 1: // Position
      if (!data.position) {
        errors.push('Please select your position on the bill');
      }
      if (!data.billTitle) {
        errors.push('Bill title is required');
      }
      if (!data.recipientName || !data.recipientTitle) {
        errors.push('Representative information is required');
      }
      break;

    case 2: // Personal Story (optional)
      // Story is optional, always valid
      break;

    case 3: // Key Points
      if (!data.keyPoints || data.keyPoints.length === 0) {
        errors.push('Please add at least one key point');
      }
      break;

    case 4: // Customization
      if (!data.tone) {
        errors.push('Please select a tone');
      }
      if (!data.length) {
        errors.push('Please select a length');
      }
      break;

    case 5: // Review (always valid, final step)
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get suggested key points based on template and position
 */
export function getSuggestedKeyPoints(
  template: LetterTemplate,
  position: 'support' | 'oppose' | 'concerned' | 'neutral',
  billSummary?: string
): string[] {
  const guidance = getTemplateGuidance(template);
  let points = [...guidance.suggestedPoints];

  // Customize based on position
  if (position === 'support') {
    points = [
      'Benefits of this legislation for constituents',
      'How this aligns with community values',
      'Economic or social impact of passing this bill',
      ...points,
    ];
  } else if (position === 'oppose') {
    points = [
      'Concerns about unintended consequences',
      'Alternative solutions to consider',
      'Potential burden on constituents',
      ...points,
    ];
  }

  return points.slice(0, 5); // Limit to 5 suggestions
}

/**
 * Letter quality check
 */
export interface QualityCheck {
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  wordCount: number;
  readabilityLevel: 'easy' | 'moderate' | 'complex';
}

export function checkLetterQuality(letter: GeneratedLetter): QualityCheck {
  const { content, wordCount } = letter;

  const strengths: string[] = [];
  const improvements: string[] = [];
  let score = 70; // Base score

  // Check length appropriateness
  if (wordCount >= 150 && wordCount <= 400) {
    strengths.push('Good length - concise but detailed');
    score += 10;
  } else if (wordCount < 100) {
    improvements.push('Consider adding more detail to strengthen your points');
    score -= 10;
  } else if (wordCount > 500) {
    improvements.push('Consider making your letter more concise');
    score -= 5;
  }

  // Check for personal story
  if (content.toLowerCase().includes('i ') || content.toLowerCase().includes('my ')) {
    strengths.push('Includes personal perspective');
    score += 5;
  } else {
    improvements.push('Adding personal context makes letters more impactful');
  }

  // Check for specific request
  if (
    content.toLowerCase().includes('request') ||
    content.toLowerCase().includes('ask') ||
    content.toLowerCase().includes('urge')
  ) {
    strengths.push('Clear call to action');
    score += 5;
  } else {
    improvements.push('Include a specific request or call to action');
    score -= 5;
  }

  // Check for respectful tone
  if (content.toLowerCase().includes('respectfully') || content.toLowerCase().includes('sincerely')) {
    strengths.push('Maintains respectful tone');
    score += 5;
  }

  // Estimate readability
  const avgWordLength = content.length / wordCount;
  const readabilityLevel: 'easy' | 'moderate' | 'complex' =
    avgWordLength < 5 ? 'easy' : avgWordLength < 6.5 ? 'moderate' : 'complex';

  if (readabilityLevel === 'moderate') {
    strengths.push('Good readability level');
    score += 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    strengths,
    improvements,
    wordCount,
    readabilityLevel,
  };
}

/**
 * Generate letter from guided process state
 */
export async function generateFromGuidedProcess(
  state: GuidedLetterState,
  signal?: AbortSignal
): Promise<GeneratedLetter> {
  // Validate all required fields are present
  if (!state.data.position || !state.data.billTitle || !state.data.recipientName || !state.data.recipientTitle) {
    throw new Error('Missing required fields for letter generation');
  }

  if (!state.data.keyPoints || state.data.keyPoints.length === 0) {
    throw new Error('At least one key point is required');
  }

  const letterInput: LetterInput = {
    billTitle: state.data.billTitle,
    billNumber: state.data.billNumber,
    position: state.data.position,
    recipientName: state.data.recipientName,
    recipientTitle: state.data.recipientTitle,
    recipientAddress: state.data.recipientAddress,
    personalStory: state.data.personalStory,
    keyPoints: state.data.keyPoints,
    specificRequest: state.data.specificRequest,
    tone: state.data.tone || 'formal',
    length: state.data.length || 'medium',
    includeCallToAction: state.data.includeCallToAction !== false,
  };

  return await generateLetter(letterInput, signal);
}
