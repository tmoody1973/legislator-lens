# External API Integration Guide

## Overview

Legislator Lens integrates with multiple external APIs to provide comprehensive legislative data and contextual information. This guide covers implementation details for each API.

## 1. Congress.gov API

### Overview
The Congress.gov API provides access to legislative data including bills, amendments, committee reports, and congressional records.

**Base URL**: `https://api.congress.gov/v3`
**Authentication**: API Key (required in header)
**Rate Limits**: 5,000 requests per hour

### Setup

```typescript
// lib/api/congress.ts

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY!;
const BASE_URL = 'https://api.congress.gov/v3';

interface CongressAPIOptions {
  endpoint: string;
  params?: Record<string, string | number>;
}

export class CongressAPI {
  private async request<T>(options: CongressAPIOptions): Promise<T> {
    const url = new URL(`${BASE_URL}/${options.endpoint}`);

    // Add API key
    url.searchParams.append('api_key', CONGRESS_API_KEY);

    // Add additional parameters
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Congress API error: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### Fetching Bills

```typescript
// lib/api/congress/bills.ts

export interface Bill {
  congress: number;
  type: string;
  number: number;
  title: string;
  introducedDate: string;
  updateDate: string;
  originChamber: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
}

export interface BillDetail extends Bill {
  sponsors: Sponsor[];
  cosponsors: Cosponsor[];
  committees: Committee[];
  actions: Action[];
  subjects: Subject[];
  summaries: Summary[];
  textVersions: TextVersion[];
}

export interface Sponsor {
  bioguideId: string;
  fullName: string;
  party: string;
  state: string;
}

export class BillsAPI extends CongressAPI {
  // Get list of bills
  async getBills(congress: number = 118, options: {
    limit?: number;
    offset?: number;
    sort?: 'updateDate+desc' | 'updateDate+asc';
  } = {}): Promise<{ bills: Bill[]; pagination: Pagination }> {
    const response = await this.request<any>({
      endpoint: `bill/${congress}`,
      params: {
        format: 'json',
        limit: options.limit || 20,
        offset: options.offset || 0,
        sort: options.sort || 'updateDate+desc',
      },
    });

    return {
      bills: response.bills || [],
      pagination: response.pagination,
    };
  }

  // Get specific bill details
  async getBillDetail(
    congress: number,
    billType: string,
    billNumber: number
  ): Promise<BillDetail> {
    const response = await this.request<any>({
      endpoint: `bill/${congress}/${billType}/${billNumber}`,
      params: { format: 'json' },
    });

    return response.bill;
  }

  // Get bill text
  async getBillText(
    congress: number,
    billType: string,
    billNumber: number
  ): Promise<{ textVersions: TextVersion[] }> {
    const response = await this.request<any>({
      endpoint: `bill/${congress}/${billType}/${billNumber}/text`,
      params: { format: 'json' },
    });

    return response;
  }

  // Get bill full text content
  async getBillFullText(textUrl: string): Promise<string> {
    // Congress.gov provides text in various formats
    // Prefer plain text format for AI processing
    const response = await fetch(textUrl);
    return await response.text();
  }

  // Get bill summaries
  async getBillSummaries(
    congress: number,
    billType: string,
    billNumber: number
  ): Promise<Summary[]> {
    const response = await this.request<any>({
      endpoint: `bill/${congress}/${billType}/${billNumber}/summaries`,
      params: { format: 'json' },
    });

    return response.summaries || [];
  }

  // Get bill actions
  async getBillActions(
    congress: number,
    billType: string,
    billNumber: number
  ): Promise<Action[]> {
    const response = await this.request<any>({
      endpoint: `bill/${congress}/${billType}/${billNumber}/actions`,
      params: { format: 'json' },
    });

    return response.actions || [];
  }

  // Search bills
  async searchBills(query: string, options: {
    congress?: number;
    limit?: number;
  } = {}): Promise<{ bills: Bill[] }> {
    const response = await this.request<any>({
      endpoint: 'bill',
      params: {
        format: 'json',
        query: query,
        congress: options.congress || 118,
        limit: options.limit || 20,
      },
    });

    return { bills: response.bills || [] };
  }
}

// Export singleton instance
export const billsAPI = new BillsAPI();
```

### Rate Limiting & Caching

```typescript
// lib/api/congress/rate-limiter.ts

class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 5000;
  private readonly windowMs = 3600000; // 1 hour

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getRequestsRemaining(): number {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.maxRequests - this.requests.length;
  }
}

export const congressRateLimiter = new RateLimiter();

// Cache layer
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function cachedCongressRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 1 hour default
): Promise<T> {
  // Check cache first
  const cached = await redis.get(key);
  if (cached) {
    return cached as T;
  }

  // Check rate limit
  if (!congressRateLimiter.canMakeRequest()) {
    throw new Error('Congress API rate limit exceeded');
  }

  // Make request
  const data = await fetcher();
  congressRateLimiter.recordRequest();

  // Cache result
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}
```

### Database Sync Strategy

```typescript
// lib/api/congress/sync.ts

import { supabase } from '@/lib/db/supabase';
import { billsAPI } from './bills';

export async function syncRecentBills(congress: number = 118): Promise<void> {
  let offset = 0;
  const limit = 250;
  let hasMore = true;

  while (hasMore) {
    // Fetch batch of bills
    const { bills, pagination } = await billsAPI.getBills(congress, {
      limit,
      offset,
      sort: 'updateDate+desc',
    });

    if (bills.length === 0) {
      hasMore = false;
      break;
    }

    // Transform and insert into database
    const billRecords = bills.map(bill => ({
      congress_id: `${bill.congress}-${bill.type}-${bill.number}`,
      title: bill.title,
      congress_number: bill.congress,
      bill_type: bill.type,
      bill_number: bill.number,
      introduced_date: bill.introducedDate,
      updated_date: bill.updateDate,
      origin_chamber: bill.originChamber,
      latest_action: bill.latestAction,
    }));

    // Upsert to database
    const { error } = await supabase
      .from('bills')
      .upsert(billRecords, {
        onConflict: 'congress_id',
      });

    if (error) {
      console.error('Error syncing bills:', error);
      throw error;
    }

    offset += limit;
    hasMore = pagination.next !== null;

    // Respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Fetch and store full bill details
export async function fetchBillDetails(congressId: string): Promise<void> {
  const [congress, type, number] = congressId.split('-');

  // Get bill detail
  const billDetail = await billsAPI.getBillDetail(
    Number(congress),
    type,
    Number(number)
  );

  // Get bill text
  const { textVersions } = await billsAPI.getBillText(
    Number(congress),
    type,
    Number(number)
  );

  let fullText = '';
  if (textVersions.length > 0) {
    const latestVersion = textVersions[0];
    if (latestVersion.formats) {
      const txtFormat = latestVersion.formats.find(f => f.type === 'Formatted Text');
      if (txtFormat) {
        fullText = await billsAPI.getBillFullText(txtFormat.url);
      }
    }
  }

  // Update database with full details
  const { error } = await supabase
    .from('bills')
    .update({
      full_text: fullText,
      sponsor_name: billDetail.sponsors?.[0]?.fullName,
      sponsor_party: billDetail.sponsors?.[0]?.party,
      sponsor_state: billDetail.sponsors?.[0]?.state,
      cosponsors_count: billDetail.cosponsors?.length || 0,
      committees: billDetail.committees || [],
      subjects: billDetail.subjects || [],
      updated_at: new Date().toISOString(),
    })
    .eq('congress_id', congressId);

  if (error) {
    console.error('Error updating bill details:', error);
    throw error;
  }
}
```

## 2. NewsAPI

### Overview
NewsAPI provides access to news articles from various sources worldwide.

**Base URL**: `https://newsapi.org/v2`
**Authentication**: API Key (query parameter)
**Rate Limits**: 100 requests per day (developer), 250/day (paid)

### Implementation

```typescript
// lib/api/news.ts

const NEWS_API_KEY = process.env.NEWS_API_KEY!;
const BASE_URL = 'https://newsapi.org/v2';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export class NewsAPI {
  async searchNews(query: string, options: {
    from?: string;
    to?: string;
    language?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
    page?: number;
  } = {}): Promise<{ articles: NewsArticle[]; totalResults: number }> {
    const url = new URL(`${BASE_URL}/everything`);

    url.searchParams.append('apiKey', NEWS_API_KEY);
    url.searchParams.append('q', query);

    if (options.from) url.searchParams.append('from', options.from);
    if (options.to) url.searchParams.append('to', options.to);
    if (options.language) url.searchParams.append('language', options.language);
    if (options.sortBy) url.searchParams.append('sortBy', options.sortBy);
    if (options.pageSize) url.searchParams.append('pageSize', String(options.pageSize));
    if (options.page) url.searchParams.append('page', String(options.page));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      articles: data.articles || [],
      totalResults: data.totalResults || 0,
    };
  }

  async getTopHeadlines(options: {
    country?: string;
    category?: string;
    sources?: string;
    q?: string;
    pageSize?: number;
  } = {}): Promise<{ articles: NewsArticle[] }> {
    const url = new URL(`${BASE_URL}/top-headlines`);

    url.searchParams.append('apiKey', NEWS_API_KEY);

    if (options.country) url.searchParams.append('country', options.country);
    if (options.category) url.searchParams.append('category', options.category);
    if (options.sources) url.searchParams.append('sources', options.sources);
    if (options.q) url.searchParams.append('q', options.q);
    if (options.pageSize) url.searchParams.append('pageSize', String(options.pageSize));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    return { articles: data.articles || [] };
  }
}

export const newsAPI = new NewsAPI();

// Find news related to a bill
export async function findBillRelatedNews(
  billTitle: string,
  billNumber: string
): Promise<NewsArticle[]> {
  const queries = [
    billTitle,
    billNumber,
    `${billTitle} Congress`,
    `${billNumber} legislation`,
  ];

  const results = await Promise.all(
    queries.map(query =>
      newsAPI.searchNews(query, {
        language: 'en',
        sortBy: 'relevancy',
        pageSize: 5,
      })
    )
  );

  // Combine and deduplicate articles
  const allArticles = results.flatMap(r => r.articles);
  const unique = Array.from(
    new Map(allArticles.map(a => [a.url, a])).values()
  );

  return unique;
}
```

## 3. Guardian API

### Overview
The Guardian API provides access to articles from The Guardian and The Observer.

**Base URL**: `https://content.guardianapis.com`
**Authentication**: API Key (query parameter)
**Rate Limits**: 5,000 requests per day (developer tier)

### Implementation

```typescript
// lib/api/guardian.ts

const GUARDIAN_API_KEY = process.env.GUARDIAN_API_KEY!;
const BASE_URL = 'https://content.guardianapis.com';

export interface GuardianArticle {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  fields?: {
    headline?: string;
    trailText?: string;
    bodyText?: string;
    thumbnail?: string;
  };
}

export class GuardianAPI {
  async searchContent(query: string, options: {
    fromDate?: string;
    toDate?: string;
    orderBy?: 'newest' | 'oldest' | 'relevance';
    pageSize?: number;
    page?: number;
    showFields?: string;
  } = {}): Promise<{ results: GuardianArticle[]; total: number }> {
    const url = new URL(`${BASE_URL}/search`);

    url.searchParams.append('api-key', GUARDIAN_API_KEY);
    url.searchParams.append('q', query);
    url.searchParams.append('show-fields', options.showFields || 'headline,trailText,bodyText,thumbnail');

    if (options.fromDate) url.searchParams.append('from-date', options.fromDate);
    if (options.toDate) url.searchParams.append('to-date', options.toDate);
    if (options.orderBy) url.searchParams.append('order-by', options.orderBy);
    if (options.pageSize) url.searchParams.append('page-size', String(options.pageSize));
    if (options.page) url.searchParams.append('page', String(options.page));

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Guardian API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      results: data.response?.results || [],
      total: data.response?.total || 0,
    };
  }
}

export const guardianAPI = new GuardianAPI();
```

## Combined News Integration

```typescript
// lib/api/news/aggregator.ts

import { newsAPI, NewsArticle } from './news';
import { guardianAPI, GuardianArticle } from './guardian';
import { summarizeBill } from '../ai/summarizer';

export interface AggregatedArticle {
  source: 'newsapi' | 'guardian';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  relevanceScore?: number;
  summary?: string;
}

export async function aggregateBillNews(
  billTitle: string,
  billNumber: string
): Promise<AggregatedArticle[]> {
  // Fetch from both sources
  const [newsApiResults, guardianResults] = await Promise.all([
    newsAPI.searchNews(`${billTitle} OR ${billNumber}`, {
      language: 'en',
      sortBy: 'relevancy',
      pageSize: 10,
    }),
    guardianAPI.searchContent(`${billTitle} ${billNumber}`, {
      orderBy: 'relevance',
      pageSize: 10,
    }),
  ]);

  // Transform NewsAPI articles
  const newsApiArticles: AggregatedArticle[] = newsApiResults.articles.map(article => ({
    source: 'newsapi',
    title: article.title,
    description: article.description || '',
    url: article.url,
    imageUrl: article.urlToImage || undefined,
    publishedAt: article.publishedAt,
  }));

  // Transform Guardian articles
  const guardianArticles: AggregatedArticle[] = guardianResults.results.map(article => ({
    source: 'guardian',
    title: article.webTitle,
    description: article.fields?.trailText || '',
    url: article.webUrl,
    imageUrl: article.fields?.thumbnail,
    publishedAt: article.webPublicationDate,
  }));

  // Combine and deduplicate
  const allArticles = [...newsApiArticles, ...guardianArticles];

  // Calculate relevance scores using AI
  const articlesWithScores = await Promise.all(
    allArticles.map(async (article) => {
      const score = await calculateRelevanceScore(
        article.title,
        article.description,
        billTitle
      );

      return { ...article, relevanceScore: score };
    })
  );

  // Sort by relevance
  return articlesWithScores.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

// Use AI to calculate article relevance
async function calculateRelevanceScore(
  articleTitle: string,
  articleDescription: string,
  billTitle: string
): Promise<number> {
  // Simple keyword matching for now
  // Can be enhanced with Prompt API for semantic analysis
  const keywords = billTitle.toLowerCase().split(' ');
  const content = `${articleTitle} ${articleDescription}`.toLowerCase();

  let score = 0;
  keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      score += 1;
    }
  });

  return Math.min(score / keywords.length, 1);
}
```

## Environment Variables

```bash
# .env.local

# Congress.gov API
CONGRESS_API_KEY=your_congress_api_key

# NewsAPI
NEWS_API_KEY=your_news_api_key

# Guardian API
GUARDIAN_API_KEY=your_guardian_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Redis (optional, for caching)
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token
```

## API Request Best Practices

1. **Always use caching** to minimize API calls
2. **Implement rate limiting** to avoid exceeding quotas
3. **Handle errors gracefully** with meaningful fallbacks
4. **Use environment variables** for API keys
5. **Monitor API usage** to track costs and limits
6. **Batch requests** when possible
7. **Implement retry logic** for transient failures
