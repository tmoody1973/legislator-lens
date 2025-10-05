'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertCircle } from 'lucide-react';

export default function OriginTrialTestPage() {
  const [checks, setChecks] = useState<any>(null);

  useEffect(() => {
    const runChecks = async () => {
      const results: any = {
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
        chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown',
        apis: {},
      };

      // Check Chrome 138+ stable APIs
      results.apis.summarizer = 'Summarizer' in self;
      results.apis.writer = 'Writer' in self;
      results.apis.languageModel = 'LanguageModel' in self;
      results.apis.rewriter = 'Rewriter' in self;

      // Try to check availability
      if ('Summarizer' in self) {
        try {
          const availability = await (self as any).Summarizer.availability();
          results.apis.summarizerAvailability = availability;
        } catch (e) {
          results.apis.summarizerError = (e as Error).message;
        }
      }

      if ('Writer' in self) {
        try {
          const availability = await (self as any).Writer.availability();
          results.apis.writerAvailability = availability;
        } catch (e) {
          results.apis.writerError = (e as Error).message;
        }
      }

      if ('LanguageModel' in self) {
        try {
          const availability = await (self as any).LanguageModel.availability();
          results.apis.languageModelAvailability = availability;
        } catch (e) {
          results.apis.languageModelError = (e as Error).message;
        }
      }

      setChecks(results);
    };

    runChecks();
  }, []);

  if (!checks) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Loading checks...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Chrome AI API Status (Chrome 138+)</h1>
      <p className="text-muted-foreground mb-6">Diagnostic page for Chrome Built-in AI API availability</p>

      <div className="space-y-6">
        {/* Browser Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {parseInt(checks.chromeVersion) >= 138 ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
              Browser Information
            </CardTitle>
            <CardDescription>
              Chrome version: {checks.chromeVersion} {parseInt(checks.chromeVersion) >= 138 ? '✓' : '(Need 138+)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono break-all">{checks.browser}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Chrome Built-in AI requires Chrome 138+ stable with proper hardware
            </div>
          </CardContent>
        </Card>

        {/* API Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Chrome Built-in AI APIs (Chrome 138+)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Summarizer API</span>
              {checks.apis.summarizer ? (
                <Badge variant="default">Available</Badge>
              ) : (
                <Badge variant="destructive">Not Available</Badge>
              )}
            </div>

            {checks.apis.summarizerAvailability && (
              <div className="ml-4 text-sm">
                Status: <Badge variant="secondary">{checks.apis.summarizerAvailability}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Writer API</span>
              {checks.apis.writer ? (
                <Badge variant="default">Available</Badge>
              ) : (
                <Badge variant="secondary">Not Available</Badge>
              )}
            </div>

            {checks.apis.writerAvailability && (
              <div className="ml-4 text-sm">
                Status: <Badge variant="secondary">{checks.apis.writerAvailability}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">LanguageModel API (Prompt API)</span>
              {checks.apis.languageModel ? (
                <Badge variant="default">Available</Badge>
              ) : (
                <Badge variant="secondary">Not Available</Badge>
              )}
            </div>

            {checks.apis.languageModelAvailability && (
              <div className="ml-4 text-sm">
                Status: <Badge variant="secondary">{checks.apis.languageModelAvailability}</Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Rewriter API</span>
              {checks.apis.rewriter ? (
                <Badge variant="default">Available</Badge>
              ) : (
                <Badge variant="secondary">Not Available</Badge>
              )}
            </div>

            {checks.apis.summarizerError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded">
                <div className="text-sm font-medium mb-1 text-red-600 dark:text-red-400">Summarizer Error:</div>
                <div className="text-xs text-red-600 dark:text-red-400">{checks.apis.summarizerError}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        {!checks.apis.summarizer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Requirements for Chrome Built-in AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-medium mb-1">1. Chrome Version 138+</div>
                <div className="text-sm text-muted-foreground">
                  Download latest Chrome from{' '}
                  <a
                    href="https://www.google.com/chrome/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    google.com/chrome
                  </a>
                  <br />
                  Current version: {checks.chromeVersion}
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">2. Hardware Requirements</div>
                <div className="text-sm text-muted-foreground">
                  • 22 GB free disk space
                  <br />
                  • 4+ GB VRAM (dedicated GPU required)
                  <br />
                  • Windows 10/11, macOS 13+, Linux, or ChromeOS
                  <br />• Unmetered internet connection
                </div>
              </div>

              <div>
                <div className="font-medium mb-1">3. Alternative: Use Cloud AI</div>
                <div className="text-sm text-muted-foreground">
                  This app supports cloud AI fallback which works on any browser without special requirements.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
