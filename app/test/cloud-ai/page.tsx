'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Cloud } from 'lucide-react';

export default function CloudAITestPage() {
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleBill = {
    billId: 'hr-1234-118',
    billTitle: 'Affordable Housing Access Act',
    billSummary:
      'A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families.',
    provisions: [
      'Affordable Housing Development Grants for underserved communities',
      'Increased rental assistance funding by $5 billion annually',
      'First-time homebuyer assistance grants up to $25,000',
      'Infrastructure improvements to support housing development',
    ],
    keywords: ['housing', 'affordable housing', 'rental assistance', 'homeownership'],
    billIntroducedDate: '2024-03-15',
  };

  const runHistoricalAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bills/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: sampleBill.billId,
          billTitle: sampleBill.billTitle,
          billSummary: sampleBill.billSummary,
          provisions: sampleBill.provisions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze historical bills');
      }

      const data = await response.json();
      setHistoricalData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run historical analysis');
    } finally {
      setLoading(false);
    }
  };

  const runNewsCorrelation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bills/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: sampleBill.billId,
          billTitle: sampleBill.billTitle,
          billSummary: sampleBill.billSummary,
          keywords: sampleBill.keywords,
          billIntroducedDate: sampleBill.billIntroducedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to correlate with news');
      }

      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run news correlation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Cloud AI Test Page</h1>
        <p className="text-muted-foreground">
          Test Google Gemini (historical analysis) and Guardian (news correlation)
        </p>
      </div>

      {/* Sample Bill Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sample Bill</CardTitle>
          <CardDescription>{sampleBill.billId}</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">{sampleBill.billTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4">{sampleBill.billSummary}</p>
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Key Provisions:</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {sampleBill.provisions.map((prov, idx) => (
                <li key={idx}>{prov}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={runHistoricalAnalysis} disabled={loading} size="lg">
          <Cloud className="mr-2 h-5 w-5" />
          Gemini: Historical Analysis
        </Button>
        <Button onClick={runNewsCorrelation} disabled={loading} variant="secondary" size="lg">
          <Cloud className="mr-2 h-5 w-5" />
          Guardian: News Correlation
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin mr-3" />
          <span className="text-lg">Running analysis...</span>
        </div>
      )}

      {/* Historical Analysis Results */}
      {historicalData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Historical Analysis Results
              {historicalData.fromCache && <Badge variant="outline">Cached</Badge>}
            </CardTitle>
            <CardDescription>
              Processing Time: {historicalData.processingTime || 0}ms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Similar Bills */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Similar Bills</h3>
              <div className="space-y-3">
                {historicalData.similarBills?.map((bill: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h4 className="font-medium text-base mb-1">{bill.title}</h4>
                    <div className="text-sm text-muted-foreground mb-2">
                      {bill.congress}th Congress ({bill.year}) • {bill.outcome}
                    </div>
                    <p className="text-sm mb-2">
                      <span className="font-medium">Similarity:</span> {bill.similarity}
                    </p>
                    {bill.keyDifferences && bill.keyDifferences.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Key Differences:</span>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {bill.keyDifferences.map((diff: string, i: number) => (
                            <li key={i}>{diff}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trends */}
            {historicalData.trends && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Trends</h3>
                <ul className="space-y-2">
                  {historicalData.trends.map((trend: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-sm">{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {historicalData.recommendations && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {historicalData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Historical Context */}
            {historicalData.historicalContext && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Historical Context</h3>
                <p className="text-sm text-muted-foreground">{historicalData.historicalContext}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* News Correlation Results */}
      {newsData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              News Correlation Results
              {newsData.fromCache && <Badge variant="outline">Cached</Badge>}
            </CardTitle>
            <CardDescription>
              {newsData.totalResults} articles • Sentiment: {newsData.sentiment} • Processing Time:{' '}
              {newsData.processingTime || 0}ms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sentiment Badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Sentiment:</span>
              <Badge
                variant={
                  newsData.sentiment === 'positive'
                    ? 'default'
                    : newsData.sentiment === 'negative'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {newsData.sentiment}
              </Badge>
            </div>

            {/* Articles */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Related Articles</h3>
              <div className="space-y-3">
                {newsData.articles?.slice(0, 10).map((article: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline block mb-1"
                    >
                      {article.title}
                    </a>
                    <div className="text-sm text-muted-foreground mb-2">
                      {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                      {article.author && ` • ${article.author}`}
                    </div>
                    {article.description && (
                      <p className="text-sm text-muted-foreground">{article.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {newsData.timelineEvents && newsData.timelineEvents.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Timeline</h3>
                <div className="space-y-2">
                  {newsData.timelineEvents.map((event: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">
                        {new Date(event.date).toLocaleDateString()}
                      </Badge>
                      <span className="text-muted-foreground">{event.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
