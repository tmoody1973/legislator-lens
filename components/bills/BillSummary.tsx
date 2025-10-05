'use client';

import { useState, useEffect } from 'react';
import type { BillSummary as BillSummaryType, SummaryType } from '@/lib/ai/summarizer';
import { checkSummarizerAvailability } from '@/lib/ai/summarizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, Download, AlertCircle } from 'lucide-react';
import { AISourceBadge } from '@/components/ui/ai-source-badge';

export interface BillSummaryProps {
  congress: number;
  billType: string;
  billNumber: number;
  summaryTypes?: SummaryType[];
  onError?: (error: Error) => void;
}

export default function BillSummary({
  congress,
  billType,
  billNumber,
  summaryTypes = ['key-points', 'tl;dr'],
  onError,
}: BillSummaryProps) {
  console.log('BillSummary: Component rendering with props:', { congress, billType, billNumber });

  const [summaries, setSummaries] = useState<Record<SummaryType, BillSummaryType> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SummaryType>(summaryTypes[0]);
  const [availabilityStatus, setAvailabilityStatus] = useState<'readily' | 'downloading' | 'downloadable' | 'no' | 'checking'>('checking');
  const [aiSource, setAiSource] = useState<'chrome' | 'gemini' | null>(null);

  // Cache key for localStorage
  const cacheKey = `bill-summary-${congress}-${billType}-${billNumber}`;

  // Check availability and load cached summaries on mount
  useEffect(() => {
    async function checkAvailability() {
      console.log('BillSummary: Checking Chrome AI availability...');

      // Try to load cached summaries first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();

          // Use cache if less than 24 hours old
          if (cacheAge < 24 * 60 * 60 * 1000) {
            console.log('BillSummary: Using cached summaries');
            setSummaries(cachedData.summaries);
            setAiSource(cachedData.source);
            setAvailabilityStatus('readily'); // Don't auto-fetch if we have cache
            return;
          }
        }
      } catch (err) {
        console.error('BillSummary: Error loading cache:', err);
      }

      try {
        const availability = await checkSummarizerAvailability();
        console.log('BillSummary: Availability status:', availability);
        setAvailabilityStatus(availability.status);

        // If readily available, auto-fetch summaries with Chrome AI
        if (availability.status === 'readily') {
          console.log('BillSummary: Chrome AI is ready, auto-fetching summaries...');
          fetchSummaries('chrome');
        } else if (availability.status === 'no') {
          // If Chrome AI not available, automatically use cloud AI fallback
          console.log('BillSummary: Chrome AI not available, using cloud AI fallback...');
          fetchSummaries('gemini');
        }
      } catch (err) {
        console.error('BillSummary: Error checking availability:', err);
        setAvailabilityStatus('no');
        // Even on error, try cloud AI fallback
        fetchSummaries('gemini');
      }
    }

    checkAvailability();
  }, []);

  async function fetchSummaries(source: 'chrome' | 'gemini' = 'chrome') {
    setLoading(true);
    setError(null);
    setAiSource(source);

    try {
      if (source === 'chrome') {
        // Use Chrome AI (on-device)
        console.log('BillSummary: Fetching with Chrome AI...');
        const { generateMultipleSummaries } = await import('@/lib/ai/summarizer');

        const billTextResponse = await fetch(`/api/bills/${congress}/${billType}/${billNumber}/text`);
        if (!billTextResponse.ok) {
          throw new Error('Failed to fetch bill text. The bill may not have published text yet.');
        }

        const { text: billText } = await billTextResponse.json();

        if (!billText || billText.trim().length === 0) {
          throw new Error('Bill text is empty or not available yet.');
        }

        const generatedSummaries = await generateMultipleSummaries(billText, summaryTypes);
        setSummaries(generatedSummaries);

        // Cache the summaries
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            summaries: generatedSummaries,
            source: 'chrome',
            timestamp: new Date().toISOString(),
          }));
        } catch (err) {
          console.error('BillSummary: Error saving to cache:', err);
        }

        const availability = await checkSummarizerAvailability();
        setAvailabilityStatus(availability.status);
      } else {
        // Use cloud AI (Gemini) as fallback
        console.log('BillSummary: Fetching with cloud AI (Gemini)...');
        const typesParam = summaryTypes.join(',');
        const cloudResponse = await fetch(
          `/api/bills/${congress}/${billType}/${billNumber}/summarize-cloud?types=${typesParam}`
        );

        if (!cloudResponse.ok) {
          throw new Error('Failed to generate cloud AI summaries');
        }

        const { summaries: cloudSummaries } = await cloudResponse.json();

        // Convert cloud summaries to the same format as Chrome AI summaries
        const formattedSummaries: Record<SummaryType, BillSummaryType> = {};
        for (const [type, data] of Object.entries(cloudSummaries)) {
          formattedSummaries[type as SummaryType] = {
            summary: (data as any).summary,
            type: type as SummaryType,
            length: 'medium',
            format: (data as any).format === 'markdown' ? 'markdown' : 'plain-text',
            generatedAt: new Date((data as any).generatedAt),
            cached: false,
          };
        }

        setSummaries(formattedSummaries);

        // Cache the summaries
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            summaries: formattedSummaries,
            source: 'gemini',
            timestamp: new Date().toISOString(),
          }));
        } catch (err) {
          console.error('BillSummary: Error saving to cache:', err);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }

  // User-triggered action to start download and summarization
  async function handleGenerateSummary(source: 'chrome' | 'gemini' = 'chrome') {
    await fetchSummaries(source);
  }

  // Checking availability
  if (availabilityStatus === 'checking') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <CardDescription>Checking Chrome AI availability...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Model needs to be downloaded - show button
  if (availabilityStatus === 'downloadable' && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <AISourceBadge source="chrome" />
            <span>Chrome AI model needs to be downloaded</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Download Required</p>
              <p className="text-sm mb-4">
                Click the button below to download the Chrome AI model and generate a summary. This is a one-time
                download that happens automatically.
              </p>
              <div className="space-y-2">
                <Button onClick={() => handleGenerateSummary('chrome')} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Chrome AI Model & Generate
                </Button>
                <Button onClick={() => handleGenerateSummary('gemini')} variant="outline" className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Use Cloud AI Instead (Faster)
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Model is downloading
  if (availabilityStatus === 'downloading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <CardDescription>Downloading Chrome AI model...</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div>
                  <p className="font-medium">AI Model Downloading</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments. Please wait...</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Loading summary
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <CardDescription>Generating on-device summary with Chrome AI...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chrome AI not available
  if (availabilityStatus === 'no' || error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <CardDescription>Chrome AI not available on this browser</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">Chrome AI Features Required</p>
              {error && <p className="text-sm mb-2 text-red-600">{error}</p>}
              <p className="text-sm mb-3">
                Chrome AI is not available in your browser. You have two options:
              </p>
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <p className="font-medium text-sm mb-2">Option 1: Use Cloud AI (Recommended)</p>
                  <p className="text-sm mb-2">
                    Cloud AI works immediately in any browser and provides the same quality summaries.
                  </p>
                  <Button onClick={() => handleGenerateSummary('gemini')} variant="default" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Use Cloud AI Now
                  </Button>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="font-medium text-sm mb-2">Option 2: Enable Chrome Built-in AI</p>
                  <p className="text-sm mb-2">
                    Requires Chrome 138+ with built-in AI support. Requirements:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Chrome version 138 or higher</li>
                    <li>22 GB free storage</li>
                    <li>4+ GB VRAM (GPU required)</li>
                    <li>Unmetered internet connection</li>
                  </ul>
                  <p className="text-sm mt-2">
                    Download: <a
                      href="https://www.google.com/chrome/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      google.com/chrome
                    </a>
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // If we have summaries, show them
  if (summaries) {
    const currentSummary = summaries[selectedType];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Summary
            {currentSummary.cached && <Badge variant="outline">Cached</Badge>}
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <AISourceBadge source={aiSource || 'chrome'} />
            <span className="text-muted-foreground">
              {selectedType === 'key-points' && 'Key Points'}
              {selectedType === 'tl;dr' && 'TL;DR'}
              {selectedType === 'teaser' && 'Teaser'}
              {selectedType === 'headline' && 'Headline'}
            </span>
            {aiSource === 'gemini' && (
              <Badge variant="secondary" className="ml-auto">Cloud AI</Badge>
            )}
            {aiSource === 'chrome' && (
              <Badge variant="secondary" className="ml-auto">On-Device AI</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Type Tabs */}
          {summaryTypes.length > 1 && (
            <div className="flex gap-2 pb-4 border-b">
              {summaryTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type)}
                >
                  {type === 'key-points' && '📝 Key Points'}
                  {type === 'tl;dr' && '⚡ TL;DR'}
                  {type === 'teaser' && '🔍 Teaser'}
                  {type === 'headline' && '📰 Headline'}
                </Badge>
              ))}
            </div>
          )}

          {/* Summary Content */}
          <div>
            {currentSummary.format === 'markdown' ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(currentSummary.summary) }}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{currentSummary.summary}</p>
            )}
          </div>

          {/* Disclaimer */}
          <Alert>
            <AlertDescription className="text-xs">
              ⚠️ This summary was generated by AI and may not capture all nuances. Always read the full bill text for
              complete information.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Fallback - this should never happen but ensures something is always rendered
  console.log('BillSummary: Rendering fallback state');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          AI Summary
        </CardTitle>
        <CardDescription>Unexpected state - Check browser console for details</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertDescription>
            <p>Debug Info:</p>
            <p>Status: {availabilityStatus}</p>
            <p>Loading: {loading.toString()}</p>
            <p>Error: {error || 'none'}</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Simple markdown to HTML converter (basic implementation)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/gim, '<br />');
}
