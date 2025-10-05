'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, History } from 'lucide-react';
import { AISourceBadge } from '@/components/ui/ai-source-badge';

export interface BillHistoricalAnalysisProps {
  billId: string;
  billTitle: string;
  billSummary: string;
  provisions: string[];
}

export default function BillHistoricalAnalysis({
  billId,
  billTitle,
  billSummary,
  provisions,
}: BillHistoricalAnalysisProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistoricalAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/bills/historical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billId,
            billTitle,
            billSummary,
            provisions,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load historical analysis');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoricalAnalysis();
  }, [billId, billTitle, billSummary, provisions]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historical Analysis
          </CardTitle>
          <CardDescription>Finding similar bills from congressional history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historical Analysis
          {data.fromCache && <Badge variant="outline">Cached</Badge>}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <AISourceBadge source="cloud" provider="Google Gemini" />
          <span className="text-muted-foreground">{data.processingTime || 0}ms</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Similar Bills */}
        {data.similarBills && data.similarBills.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Similar Bills</h3>
            <div className="space-y-3">
              {data.similarBills.map((bill: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
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
        )}

        {/* Trends */}
        {data.trends && data.trends.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Legislative Trends</h3>
            <ul className="space-y-2">
              {data.trends.map((trend: string, idx: number) => (
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
        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Strategic Recommendations</h3>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Historical Context */}
        {data.historicalContext && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Historical Context</h3>
            <p className="text-sm text-muted-foreground">{data.historicalContext}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
