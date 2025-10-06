'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Cloud } from 'lucide-react';
import { AISourceBadge } from '@/components/ui/ai-source-badge';

interface QAMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface BillQAProps {
  congress: number;
  billType: string;
  billNumber: number;
  billTitle: string;
  billSummary?: string;
}

export default function BillQA({ congress, billType, billNumber, billTitle, billSummary }: BillQAProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billText, setBillText] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const suggestedQuestions = [
    'What are the main goals of this bill?',
    'Who would benefit from this legislation?',
    'What are the potential costs?',
    'Are there any controversial aspects?',
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch bill text on mount
  useEffect(() => {
    async function fetchBillText() {
      try {
        const textResponse = await fetch(`/api/bills/${congress}/${billType}/${billNumber}/text`);
        if (textResponse.ok) {
          const { text } = await textResponse.json();
          setBillText(text);
          setIsReady(true);
        } else {
          setError('Failed to load bill text');
        }
      } catch (err) {
        console.error('Error fetching bill text:', err);
        setError('Failed to load bill text');
      }
    }

    fetchBillText();
  }, [congress, billType, billNumber]);

  async function handleSendMessage(question?: string) {
    const messageToSend = question || input;

    if (!messageToSend.trim() || !isReady) return;

    // Add user message immediately
    const userMessage: QAMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Call Gemini API
      const response = await fetch('/api/bills/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: messageToSend,
          billTitle,
          billText,
          billSummary,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: QAMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get answer';
      setError(errorMsg);
      // Remove the user message since we failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  async function handleSuggestedQuestion(question: string) {
    await handleSendMessage(question);
  }

  // Loading state
  if (!isReady && !error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask Questions
          </CardTitle>
          <CardDescription>Loading bill information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !isReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask Questions
          </CardTitle>
          <CardDescription>Q&A unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              <p className="font-medium mb-2">Failed to Load Bill</p>
              <p className="text-sm">{error}</p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Active Q&A session
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Ask Questions
          <Badge variant="outline" className="ml-auto">
            <Cloud className="h-3 w-3 mr-1" />
            Gemini AI
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <AISourceBadge source="cloud" provider="Gemini" />
          <span>Ask anything about this bill</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask a question to get started</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions (only show when no messages) */}
        {messages.length === 0 && !loading && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={loading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
            placeholder="Ask a question about this bill..."
            className="flex-1 px-3 py-2 border rounded-md text-sm"
            disabled={loading}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Disclaimer */}
        <Alert>
          <AlertDescription className="text-xs">
            💡 Answers are generated by AI and may not be 100% accurate. Always verify important information.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
