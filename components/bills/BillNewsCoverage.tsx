'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Newspaper } from 'lucide-react';
import { AISourceBadge } from '@/components/ui/ai-source-badge';

export interface BillNewsCoverageProps {
  billId: string;
  billTitle: string;
  billSummary: string;
  keywords: string[];
  billIntroducedDate?: string;
}

export default function BillNewsCoverage({
  billId,
  billTitle,
  billSummary,
  keywords,
  billIntroducedDate,
}: BillNewsCoverageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsCoverage() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/bills/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billId,
            billTitle,
            billSummary,
            keywords,
            billIntroducedDate,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load news coverage');
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

    fetchNewsCoverage();
  }, [billId, billTitle, billSummary, keywords, billIntroducedDate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            News Coverage
          </CardTitle>
          <CardDescription>Finding related news articles...</CardDescription>
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
            <Newspaper className="h-5 w-5" />
            News Coverage
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

  const sentimentColor =
    data.sentiment === 'positive'
      ? 'default'
      : data.sentiment === 'negative'
        ? 'destructive'
        : 'secondary';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News Coverage
          {data.fromCache && <Badge variant="outline">Cached</Badge>}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          <AISourceBadge
            source="cloud"
            provider={`${data.sources?.guardian ? 'Guardian' : ''}${data.sources?.serpapi ? (data.sources?.guardian ? ' + Google News' : 'Google News') : ''}${data.sources?.newsapi ? ' + NewsAPI' : ''}`}
          />
          <span className="text-muted-foreground">{data.totalResults} articles</span>
          <span>•</span>
          <Badge variant={sentimentColor as any}>{data.sentiment}</Badge>
          <span>•</span>
          <span className="text-muted-foreground">{data.processingTime || 0}ms</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline */}
        {data.timelineEvents && data.timelineEvents.length > 0 && (
          <div>
            <h3 className="font-semibold text-base mb-3">Coverage Timeline</h3>
            <div className="space-y-2">
              {data.timelineEvents.slice(0, 5).map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{new Date(event.date).toLocaleDateString()}</Badge>
                  <span className="text-muted-foreground">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {data.articles && data.articles.length > 0 && (
          <div>
            <h3 className="font-semibold text-base mb-3">Related Articles</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {data.articles.slice(0, 15).map((article: any, idx: number) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
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
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
