import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { question, billTitle, billText, billSummary, conversationHistory } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Create context from bill information
    const billContext = `
Bill: ${billTitle}

Summary: ${billSummary || 'No summary available'}

Bill Text (excerpt): ${billText?.substring(0, 12000) || 'Full text not available'}

Instructions: Use the bill text above to provide specific, analytical answers. Reference actual provisions and sections when relevant.
`;

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      // Include last 6 messages for context (3 exchanges)
      const recentHistory = conversationHistory.slice(-6);
      conversationContext = '\n\nRecent conversation:\n' + recentHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    }

    const systemPrompt = `You are an expert legislative analyst helping citizens understand congressional bills.

Your role:
- Provide substantive, analytical answers based on the bill's content
- Explain complex legal language in plain terms
- Cite specific bill sections and provisions
- Analyze practical impacts, tradeoffs, and stakeholders
- Maintain political neutrality while discussing different perspectives
- Be confident and informative - avoid excessive hedging

When discussing controversial aspects:
- Identify actual policy tradeoffs (who benefits vs. who pays)
- Explain competing viewpoints with concrete examples
- Discuss fiscal impacts when relevant
- Mention affected groups specifically

Guidelines:
- Give thorough answers (3-5 paragraphs) with real substance
- Use specific examples from the bill text
- Don't just say "it's difficult to determine" - analyze what you know
- Be direct and analytical, not vague
- If information is genuinely missing, explain what specific info would help`;

    const prompt = `${systemPrompt}

${billContext}
${conversationContext}

User question: ${question}

Please provide a helpful, accurate answer based on the bill information provided.`;

    // Use Gemini 2.0 Flash with Google Search grounding
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048, // Allow longer, more complete answers
      },
    });

    // Enable Google Search grounding for real-world context
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
    });

    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Q&A API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
