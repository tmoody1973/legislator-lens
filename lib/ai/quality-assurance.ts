// Letter Quality Assurance Pipeline
// Combines Rewriter and Proofreader APIs for comprehensive quality checking

import { GeneratedLetter } from './writer';
import { LetterProofreader, ProofreadResult, ErrorTypeCount, analyzeErrorTypes } from './proofreader';
import { ContentRewriter, RewrittenContent } from './rewriter';

export interface QualityMetrics {
  // Proofreading metrics
  grammarErrors: number;
  spellingErrors: number;
  punctuationErrors: number;
  totalErrors: number;

  // Content metrics
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  readabilityScore: number; // 0-100 (higher is better)

  // Tone and style
  formalityScore: number; // 0-100 (higher is more formal)
  clarityScore: number; // 0-100 (higher is clearer)
  persuasivenessScore: number; // 0-100

  // Overall
  overallScore: number; // 0-100
}

export interface QualityFeedback {
  category: 'critical' | 'important' | 'suggestion';
  message: string;
  suggestion?: string;
}

export interface QualityAssessment {
  metrics: QualityMetrics;
  feedback: QualityFeedback[];
  proofreadResult: ProofreadResult;
  correctedLetter: string;
  suggestions: string[];
  passesQualityCheck: boolean;
}

/**
 * Comprehensive letter quality assessment
 */
export async function assessLetterQuality(
  letter: GeneratedLetter | string,
  signal?: AbortSignal
): Promise<QualityAssessment> {
  const letterText = typeof letter === 'string' ? letter : letter.content;

  // Step 1: Proofread the letter
  const proofreader = new LetterProofreader();
  await proofreader.initialize();

  let proofreadResult: ProofreadResult;
  try {
    proofreadResult = await proofreader.proofread(letterText, signal);
  } finally {
    await proofreader.destroy();
  }

  const errorCounts = analyzeErrorTypes(proofreadResult);

  // Step 2: Analyze content metrics
  const wordCount = letterText.split(/\s+/).length;
  const sentences = letterText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Step 3: Calculate scores
  const metrics = calculateQualityMetrics(
    letterText,
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    errorCounts
  );

  // Step 4: Generate feedback
  const feedback = generateQualityFeedback(metrics, proofreadResult, typeof letter === 'object' ? letter : undefined);

  // Step 5: Generate improvement suggestions
  const suggestions = generateImprovementSuggestions(metrics, proofreadResult);

  // Step 6: Determine if letter passes quality check
  const passesQualityCheck = metrics.overallScore >= 70 && errorCounts.total <= 3;

  return {
    metrics,
    feedback,
    proofreadResult,
    correctedLetter: proofreadResult.corrected,
    suggestions,
    passesQualityCheck,
  };
}

/**
 * Calculate quality metrics
 */
function calculateQualityMetrics(
  text: string,
  wordCount: number,
  sentenceCount: number,
  avgWordsPerSentence: number,
  errorCounts: ErrorTypeCount
): QualityMetrics {
  // Readability score (based on average sentence length)
  // Ideal is 15-20 words per sentence
  let readabilityScore = 100;
  if (avgWordsPerSentence > 25) {
    readabilityScore -= (avgWordsPerSentence - 25) * 2;
  } else if (avgWordsPerSentence < 10) {
    readabilityScore -= (10 - avgWordsPerSentence) * 3;
  }
  readabilityScore = Math.max(0, Math.min(100, readabilityScore));

  // Formality score (presence of formal language)
  const formalWords = ['respectfully', 'sincerely', 'kindly', 'furthermore', 'therefore', 'hereby'];
  const formalWordCount = formalWords.filter(word =>
    text.toLowerCase().includes(word)
  ).length;
  const formalityScore = Math.min(100, formalWordCount * 15 + 40);

  // Clarity score (inverse of errors and sentence complexity)
  let clarityScore = 100;
  clarityScore -= errorCounts.total * 5;
  if (avgWordsPerSentence > 30) clarityScore -= 20;
  clarityScore = Math.max(0, clarityScore);

  // Persuasiveness score (presence of persuasive elements)
  const persuasiveElements = [
    text.toLowerCase().includes('because'),
    text.toLowerCase().includes('therefore'),
    text.toLowerCase().includes('request') || text.toLowerCase().includes('urge'),
    text.toLowerCase().includes('support') || text.toLowerCase().includes('oppose'),
    wordCount >= 150 && wordCount <= 400,
  ];
  const persuasivenessScore = (persuasiveElements.filter(Boolean).length / persuasiveElements.length) * 100;

  // Overall score
  const overallScore = Math.round(
    (readabilityScore * 0.25 +
      clarityScore * 0.30 +
      formalityScore * 0.20 +
      persuasivenessScore * 0.25)
  );

  return {
    grammarErrors: errorCounts.grammar,
    spellingErrors: errorCounts.spelling,
    punctuationErrors: errorCounts.punctuation,
    totalErrors: errorCounts.total,
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readabilityScore: Math.round(readabilityScore),
    formalityScore: Math.round(formalityScore),
    clarityScore: Math.round(clarityScore),
    persuasivenessScore: Math.round(persuasivenessScore),
    overallScore,
  };
}

/**
 * Generate quality feedback
 */
function generateQualityFeedback(
  metrics: QualityMetrics,
  proofreadResult: ProofreadResult,
  letter?: GeneratedLetter
): QualityFeedback[] {
  const feedback: QualityFeedback[] = [];

  // Critical issues
  if (metrics.totalErrors > 5) {
    feedback.push({
      category: 'critical',
      message: `Found ${metrics.totalErrors} grammar and spelling errors`,
      suggestion: 'Review and accept suggested corrections before sending',
    });
  }

  if (metrics.wordCount < 100) {
    feedback.push({
      category: 'critical',
      message: 'Letter is too short',
      suggestion: 'Add more detail to strengthen your message (aim for 150-400 words)',
    });
  }

  // Important issues
  if (metrics.avgWordsPerSentence > 30) {
    feedback.push({
      category: 'important',
      message: 'Sentences are too long and complex',
      suggestion: 'Break up long sentences for better readability',
    });
  }

  if (metrics.formalityScore < 50) {
    feedback.push({
      category: 'important',
      message: 'Letter may be too casual for official correspondence',
      suggestion: 'Consider using more formal language',
    });
  }

  if (metrics.persuasivenessScore < 40) {
    feedback.push({
      category: 'important',
      message: 'Letter could be more persuasive',
      suggestion: 'Add specific reasons and a clear call to action',
    });
  }

  // Suggestions
  if (metrics.wordCount > 500) {
    feedback.push({
      category: 'suggestion',
      message: 'Letter is quite long',
      suggestion: 'Consider condensing to keep representative\'s attention',
    });
  }

  if (metrics.readabilityScore < 60) {
    feedback.push({
      category: 'suggestion',
      message: 'Readability could be improved',
      suggestion: 'Use simpler sentences and clearer language',
    });
  }

  return feedback;
}

/**
 * Generate improvement suggestions
 */
function generateImprovementSuggestions(
  metrics: QualityMetrics,
  proofreadResult: ProofreadResult
): string[] {
  const suggestions: string[] = [];

  if (proofreadResult.hasErrors) {
    suggestions.push(`Fix ${metrics.totalErrors} grammar and spelling errors`);
  }

  if (metrics.avgWordsPerSentence > 25) {
    suggestions.push('Shorten complex sentences for better clarity');
  }

  if (metrics.formalityScore < 60) {
    suggestions.push('Use more formal language appropriate for official correspondence');
  }

  if (metrics.persuasivenessScore < 60) {
    suggestions.push('Strengthen your argument with specific examples and data');
  }

  if (metrics.wordCount < 150) {
    suggestions.push('Add more detail to make your case more compelling');
  }

  if (suggestions.length === 0) {
    suggestions.push('Letter meets quality standards - ready to send!');
  }

  return suggestions;
}

/**
 * Quick quality check (pass/fail)
 */
export async function quickQualityCheck(
  letterText: string,
  signal?: AbortSignal
): Promise<{
  passes: boolean;
  score: number;
  criticalIssues: string[];
}> {
  const assessment = await assessLetterQuality(letterText, signal);

  const criticalIssues = assessment.feedback
    .filter(f => f.category === 'critical')
    .map(f => f.message);

  return {
    passes: assessment.passesQualityCheck,
    score: assessment.metrics.overallScore,
    criticalIssues,
  };
}

/**
 * Auto-improve letter using Rewriter
 */
export async function autoImproveLetter(
  letterText: string,
  focusArea: 'formality' | 'clarity' | 'length',
  signal?: AbortSignal
): Promise<RewrittenContent> {
  const rewriter = new ContentRewriter(
    focusArea === 'formality'
      ? { tone: 'more-formal', length: 'as-is' }
      : focusArea === 'clarity'
      ? { tone: 'as-is', length: 'as-is', sharedContext: 'Simplify and clarify' }
      : { tone: 'as-is', length: 'shorter' }
  );

  try {
    await rewriter.initialize();

    const originalWordCount = letterText.split(/\s+/).length;
    const rewritten = await rewriter.rewrite(letterText, signal);
    const rewrittenWordCount = rewritten.split(/\s+/).length;

    return {
      original: letterText,
      rewritten,
      tone: focusArea === 'formality' ? 'more-formal' : 'as-is',
      length: focusArea === 'length' ? 'shorter' : 'as-is',
      format: 'as-is',
      originalWordCount,
      rewrittenWordCount,
      generatedAt: new Date(),
    };
  } finally {
    await rewriter.destroy();
  }
}

/**
 * Complete letter refinement pipeline
 */
export async function refineLetter(
  letterText: string,
  signal?: AbortSignal
): Promise<{
  original: string;
  corrected: string;
  improved: string;
  assessment: QualityAssessment;
}> {
  // Step 1: Assess quality
  const assessment = await assessLetterQuality(letterText, signal);

  // Step 2: Get corrected version (fix errors)
  const corrected = assessment.correctedLetter;

  // Step 3: Auto-improve if needed
  let improved = corrected;

  if (assessment.metrics.formalityScore < 60) {
    const result = await autoImproveLetter(corrected, 'formality', signal);
    improved = result.rewritten;
  } else if (assessment.metrics.clarityScore < 70) {
    const result = await autoImproveLetter(corrected, 'clarity', signal);
    improved = result.rewritten;
  } else if (assessment.metrics.wordCount > 450) {
    const result = await autoImproveLetter(corrected, 'length', signal);
    improved = result.rewritten;
  }

  return {
    original: letterText,
    corrected,
    improved,
    assessment,
  };
}
