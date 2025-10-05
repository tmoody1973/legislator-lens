'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Zap, Cloud, Check, X } from 'lucide-react';

export default function HybridAITestPage() {
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sample bill data for testing
  const sampleBill = {
    billId: 'hr-1234-118',
    billTitle: 'Affordable Housing Access Act',
    billSummary:
      'A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families.',
    billText: `
      SECTION 1. SHORT TITLE.
      This Act may be cited as the "Affordable Housing Access Act".

      SECTION 2. FINDINGS.
      Congress finds the following:
      (1) Access to affordable housing is essential for economic stability and social mobility.
      (2) Millions of American families spend more than 30% of their income on housing costs.
      (3) Federal investment in affordable housing has decreased significantly over the past decades.

      SECTION 3. AFFORDABLE HOUSING DEVELOPMENT GRANTS.
      (a) ESTABLISHMENT.—The Secretary of Housing and Urban Development shall establish a grant program to support the development of affordable housing units in underserved communities.

      (b) ELIGIBLE USES.—Grant funds may be used for:
      (1) Construction of new affordable housing units;
      (2) Rehabilitation of existing housing stock;
      (3) Infrastructure improvements to support housing development;
      (4) Technical assistance for local housing authorities.

      SECTION 4. EXPANDED HOUSING ASSISTANCE.
      (a) RENTAL ASSISTANCE.—The rental assistance program under section 8 of the United States Housing Act of 1937 is amended to increase funding by $5,000,000,000 annually.

      (b) FIRST-TIME HOMEBUYER ASSISTANCE.—The Secretary shall establish a program to provide down payment assistance grants of up to $25,000 for qualified first-time homebuyers with household incomes below 120% of area median income.

      SECTION 5. AUTHORIZATION OF APPROPRIATIONS.
      There are authorized to be appropriated such sums as may be necessary to carry out this Act for fiscal years 2024 through 2029.
    `,
    billIntroducedDate: '2024-03-15',
  };

  const checkAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bills/analyze');
      const data = await response.json();

      setAvailability(data.availability);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (level: 'quick' | 'standard' | 'deep') => {
    try {
      setLoading(true);
      setError(null);
      setAnalysisResult(null);

      const response = await fetch('/api/bills/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sampleBill,
          analysisLevel: level,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Hybrid AI Test Page</h1>
        <p className="text-muted-foreground">
          Test Chrome AI (on-device) and Cloud AI (Gemini, Guardian) integration
        </p>
      </div>

      {/* Availability Check */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Availability Check</CardTitle>
          <CardDescription>Check which AI providers are currently available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkAvailability} disabled={loading} className="mb-4">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </Button>

          {availability && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Chrome AI (On-Device)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(availability.chrome).map(([api, available]) => (
                    <div key={api} className="flex items-center gap-2">
                      {available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{api}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Cloud AI
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(availability.cloud).map(([api, available]) => (
                    <div key={api} className="flex items-center gap-2">
                      {available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">{api}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Test */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Bill Analysis</CardTitle>
          <CardDescription>
            Sample Bill: {sampleBill.billTitle} ({sampleBill.billId})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => runAnalysis('quick')} disabled={loading} variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              Quick (Chrome AI Only)
            </Button>
            <Button onClick={() => runAnalysis('standard')} disabled={loading} variant="outline">
              <Zap className="mr-2 h-4 w-4" />
              <Cloud className="mr-2 h-4 w-4" />
              Standard (Balanced)
            </Button>
            <Button onClick={() => runAnalysis('deep')} disabled={loading}>
              <Cloud className="mr-2 h-4 w-4" />
              Deep (Full AI)
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Running analysis...</span>
            </div>
          )}

          {analysisResult && <AnalysisResults result={analysisResult} />}
        </CardContent>
      </Card>
    </div>
  );
}

function AnalysisResults({ result }: { result: any }) {
  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Chrome AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.processingTime?.chrome || 0}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cloud AI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.processingTime?.cloud || 0}ms</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.processingTime?.total || 0}ms</div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Used */}
      <div className="flex gap-2">
        <span className="text-sm font-medium">Providers:</span>
        {result.providers?.chrome && <Badge>Chrome AI</Badge>}
        {result.providers?.gemini && <Badge variant="secondary">Gemini</Badge>}
        {result.providers?.news && <Badge variant="secondary">News APIs</Badge>}
        {result.fromCache && <Badge variant="outline">Cached</Badge>}
      </div>

      {/* Analysis Results */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="provisions">Provisions</TabsTrigger>
          {result.enhanced?.historicalAnalysis && (
            <TabsTrigger value="historical">Historical</TabsTrigger>
          )}
          {result.enhanced?.newsCorrelation && <TabsTrigger value="news">News</TabsTrigger>}
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {result.core?.summary && (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Key Points</h4>
                    <p className="text-sm text-muted-foreground">
                      {result.core.summary['key-points']}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">TL;DR</h4>
                    <p className="text-sm text-muted-foreground">{result.core.summary['tl;dr']}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="pt-6">
              {result.core?.categories && (
                <div className="space-y-2">
                  {result.core.categories.map((cat: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <Badge variant="outline">{Math.round(cat.confidence * 100)}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provisions">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {result.core?.provisions &&
                result.core.provisions.map((prov: any, idx: number) => (
                  <div key={idx}>
                    <h4 className="font-semibold">{prov.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{prov.description}</p>
                    <p className="text-sm">
                      <span className="font-medium">Impact:</span> {prov.impact}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {result.enhanced?.historicalAnalysis && (
          <TabsContent value="historical">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Similar Bills</h4>
                  {result.enhanced.historicalAnalysis.similarBills?.map((bill: any, idx: number) => (
                    <div key={idx} className="mb-4 p-3 border rounded">
                      <div className="font-medium">{bill.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {bill.congress}th Congress ({bill.year}) - {bill.outcome}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {result.enhanced?.newsCorrelation && (
          <TabsContent value="news">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">
                    Related Articles ({result.enhanced.newsCorrelation.totalResults})
                  </h4>
                  {result.enhanced.newsCorrelation.articles?.slice(0, 5).map((article: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 border rounded">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {article.title}
                      </a>
                      <div className="text-sm text-muted-foreground">{article.source}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
