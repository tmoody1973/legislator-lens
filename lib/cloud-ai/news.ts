// News API Integration
// Correlate bills with current events using NewsAPI and Guardian API

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: Date;
  author?: string;
  imageUrl?: string;
  relevance?: number; // 0-100 score
}

export interface NewsCorrelation {
  articles: NewsArticle[];
  totalResults: number;
  keywords: string[];
  timelineEvents: Array<{
    date: Date;
    event: string;
    articles: NewsArticle[];
  }>;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
}

/**
 * Fetch news from NewsAPI
 */
async function fetchFromNewsAPI(
  query: string,
  from?: Date,
  to?: Date
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY;

  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      apiKey,
      language: 'en',
      sortBy: 'relevancy',
      pageSize: '20',
    });

    if (from) {
      params.append('from', from.toISOString().split('T')[0]);
    }
    if (to) {
      params.append('to', to.toISOString().split('T')[0]);
    }

    const response = await fetch(`https://newsapi.org/v2/everything?${params}`);

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      source: article.source.name,
      publishedAt: new Date(article.publishedAt),
      author: article.author,
      imageUrl: article.urlToImage,
    }));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return [];
  }
}

/**
 * Fetch news from Guardian API
 */
async function fetchFromGuardianAPI(
  query: string,
  from?: Date,
  to?: Date
): Promise<NewsArticle[]> {
  const apiKey = process.env.GUARDIAN_API_KEY || process.env.NEXT_PUBLIC_GUARDIAN_API_KEY;

  if (!apiKey) {
    console.warn('Guardian API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      'api-key': apiKey,
      'show-fields': 'headline,trailText,thumbnail,byline',
      'page-size': '20',
      'order-by': 'relevance',
    });

    if (from) {
      params.append('from-date', from.toISOString().split('T')[0]);
    }
    if (to) {
      params.append('to-date', to.toISOString().split('T')[0]);
    }

    const response = await fetch(`https://content.guardianapis.com/search?${params}`);

    if (!response.ok) {
      throw new Error(`Guardian API error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.response.results.map((article: any) => ({
      title: article.fields?.headline || article.webTitle,
      description: article.fields?.trailText || '',
      url: article.webUrl,
      source: 'The Guardian',
      publishedAt: new Date(article.webPublicationDate),
      author: article.fields?.byline,
      imageUrl: article.fields?.thumbnail,
    }));
  } catch (error) {
    console.error('Guardian API fetch error:', error);
    return [];
  }
}

/**
 * Fetch news from SerpAPI (Google News)
 */
async function fetchFromSerpAPI(
  query: string,
  from?: Date,
  to?: Date
): Promise<NewsArticle[]> {
  const apiKey = process.env.SERPAPI_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_API_KEY;

  if (!apiKey) {
    console.warn('SerpAPI key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google_news',
      num: '20',
    });

    // SerpAPI uses tbs parameter for date filtering
    if (from && to) {
      const fromTimestamp = Math.floor(from.getTime() / 1000);
      const toTimestamp = Math.floor(to.getTime() / 1000);
      params.append('tbs', `cdr:1,cd_min:${fromTimestamp},cd_max:${toTimestamp}`);
    }

    const response = await fetch(`https://serpapi.com/search?${params}`);

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.news_results || data.news_results.length === 0) {
      return [];
    }

    return data.news_results.map((article: any) => ({
      title: article.title || article.snippet,
      description: article.snippet || '',
      url: article.link,
      source: article.source?.name || 'Google News',
      publishedAt: article.date ? new Date(article.date) : new Date(),
      imageUrl: article.thumbnail,
    }));
  } catch (error) {
    console.error('SerpAPI fetch error:', error);
    return [];
  }
}

/**
 * Find news articles related to a bill
 */
export async function findRelatedNews(
  billTitle: string,
  keywords: string[],
  options?: {
    from?: Date;
    to?: Date;
    maxResults?: number;
    sources?: ('newsapi' | 'guardian' | 'serpapi')[];
  }
): Promise<NewsArticle[]> {
  const { from, to, maxResults = 30, sources = ['guardian', 'serpapi', 'newsapi'] } = options || {};

  // Build search query
  const queryParts = [billTitle, ...keywords];
  const query = queryParts.join(' OR ');

  // Fetch from multiple sources in parallel
  const promises: Promise<NewsArticle[]>[] = [];

  if (sources.includes('guardian')) {
    promises.push(fetchFromGuardianAPI(query, from, to));
  }

  if (sources.includes('serpapi')) {
    promises.push(fetchFromSerpAPI(query, from, to));
  }

  if (sources.includes('newsapi')) {
    promises.push(fetchFromNewsAPI(query, from, to));
  }

  const results = await Promise.all(promises);

  // Combine and deduplicate articles
  const allArticles = results.flat();
  const uniqueArticles = deduplicateArticles(allArticles);

  // Sort by date (most recent first) and relevance
  uniqueArticles.sort((a, b) => {
    // Prioritize by date
    const dateDiff = b.publishedAt.getTime() - a.publishedAt.getTime();
    if (Math.abs(dateDiff) > 7 * 24 * 60 * 60 * 1000) {
      // Different weeks
      return dateDiff;
    }
    // Same week - prioritize by source quality
    const sourceScore = (article: NewsArticle) => {
      if (article.source === 'The Guardian') return 3;
      if (article.source.includes('Google News')) return 2;
      return 1;
    };
    return sourceScore(b) - sourceScore(a);
  });

  return uniqueArticles.slice(0, maxResults);
}

/**
 * Correlate bill with news timeline
 */
export async function correlateBillWithNews(
  billTitle: string,
  billSummary: string,
  keywords: string[],
  billIntroducedDate?: Date
): Promise<NewsCorrelation> {
  // Search for news from 3 months before bill introduction to present
  const from = billIntroducedDate
    ? new Date(billIntroducedDate.getTime() - 90 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const to = new Date();

  const articles = await findRelatedNews(billTitle, keywords, { from, to });

  // Group articles into timeline events
  const timelineEvents = groupArticlesByTime(articles);

  // Analyze sentiment (simple heuristic for now)
  const sentiment = analyzeSentiment(articles);

  return {
    articles,
    totalResults: articles.length,
    keywords,
    timelineEvents,
    sentiment,
  };
}

/**
 * Get news context for specific bill provision
 */
export async function getProvisionNewsContext(
  provisionDescription: string,
  keywords: string[]
): Promise<NewsArticle[]> {
  const query = `${provisionDescription} ${keywords.join(' ')}`;

  // Fetch recent news only (last 6 months)
  const from = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const newsAPIArticles = await fetchFromNewsAPI(query, from);
  const guardianArticles = await fetchFromGuardianAPI(query, from);

  const allArticles = [...newsAPIArticles, ...guardianArticles];
  const uniqueArticles = deduplicateArticles(allArticles);

  return uniqueArticles.slice(0, 10);
}

/**
 * Find trending topics related to bill categories
 */
export async function findTrendingTopics(
  categories: string[]
): Promise<Array<{ topic: string; articles: NewsArticle[] }>> {
  const topics: Array<{ topic: string; articles: NewsArticle[] }> = [];

  // Search for each category
  for (const category of categories.slice(0, 3)) {
    // Limit to top 3 categories
    const articles = await findRelatedNews(category, [], {
      maxResults: 5,
      sources: ['guardian'], // Guardian for quality
    });

    if (articles.length > 0) {
      topics.push({
        topic: category,
        articles,
      });
    }
  }

  return topics;
}

/**
 * Deduplicate articles by URL
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.url)) {
      return false;
    }
    seen.add(article.url);
    return true;
  });
}

/**
 * Group articles into timeline events (by week)
 */
function groupArticlesByTime(
  articles: NewsArticle[]
): Array<{ date: Date; event: string; articles: NewsArticle[] }> {
  const groups = new Map<string, NewsArticle[]>();

  for (const article of articles) {
    // Group by week
    const weekStart = new Date(article.publishedAt);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString();

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(article);
  }

  // Convert to timeline events
  return Array.from(groups.entries())
    .map(([dateStr, articles]) => ({
      date: new Date(dateStr),
      event: `${articles.length} article${articles.length > 1 ? 's' : ''} published`,
      articles,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10); // Last 10 weeks
}

/**
 * Analyze sentiment from article titles/descriptions
 * Simple heuristic - could be enhanced with Gemini AI
 */
function analyzeSentiment(
  articles: NewsArticle[]
): 'positive' | 'neutral' | 'negative' | 'mixed' {
  if (articles.length === 0) return 'neutral';

  const positiveWords = ['support', 'approve', 'benefit', 'improve', 'success', 'advance'];
  const negativeWords = ['oppose', 'reject', 'harm', 'fail', 'concern', 'problem'];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const article of articles) {
    const text = `${article.title} ${article.description}`.toLowerCase();

    for (const word of positiveWords) {
      if (text.includes(word)) positiveCount++;
    }

    for (const word of negativeWords) {
      if (text.includes(word)) negativeCount++;
    }
  }

  const ratio = positiveCount / (positiveCount + negativeCount || 1);

  if (ratio > 0.6) return 'positive';
  if (ratio < 0.4) return 'negative';
  if (Math.abs(positiveCount - negativeCount) < 2) return 'mixed';
  return 'neutral';
}

/**
 * Check news API availability
 */
export async function checkNewsAPIAvailability(): Promise<{
  newsapi: boolean;
  guardian: boolean;
  serpapi: boolean;
}> {
  return {
    newsapi: !!(process.env.NEWS_API_KEY || process.env.NEXT_PUBLIC_NEWS_API_KEY),
    guardian: !!(process.env.GUARDIAN_API_KEY || process.env.NEXT_PUBLIC_GUARDIAN_API_KEY),
    serpapi: !!(process.env.SERPAPI_API_KEY || process.env.NEXT_PUBLIC_SERPAPI_API_KEY),
  };
}
