# Full Text Filtering for Bills

The Congress.gov API integration now supports filtering bills to only include those with full text available. This is useful for features that require analyzing actual bill content, such as AI summarization and impact analysis.

## How It Works

When `onlyWithFullText=true` is specified, the system:

1. Fetches bills from Congress.gov API
2. For each bill, checks if text versions are available via `/bill/{congress}/{billType}/{billNumber}/text` endpoint
3. Filters out bills without any text versions
4. Returns only bills with full text available

**Note:** This process makes additional API calls (one per bill), so use responsibly with rate limiting in mind.

## API Usage

### Fetch Bills with Full Text Only

```bash
# Get recent House bills with full text
GET /api/bills?billType=hr&onlyWithFullText=true

# Get recent Senate bills with full text
GET /api/bills?billType=s&onlyWithFullText=true&limit=10

# Get all bills with full text
GET /api/bills?onlyWithFullText=true
```

### Sync Bills with Full Text Only

```bash
POST /api/sync/bills
Content-Type: application/json

{
  "congress": 119,
  "limit": 50,
  "billTypes": ["hr", "s"],
  "onlyWithFullText": true
}
```

## Programmatic Usage

### Using the Congress API Client

```typescript
import { getRecentBills } from '@/lib/api/congress';

// Fetch only bills with full text
const { bills } = await getRecentBills(119, {
  limit: 20,
  billType: 'hr',
  onlyWithFullText: true,
});

console.log(`Found ${bills.length} House bills with full text`);
```

### Using the Bill Sync Service

```typescript
import { syncRecentBills } from '@/lib/services/bill-sync';

// Sync only bills with full text to Supabase
const result = await syncRecentBills(119, {
  limit: 100,
  billTypes: ['hr', 's'],
  onlyWithFullText: true,
});

console.log(`Synced ${result.totalSynced} bills with full text`);
```

## Performance Considerations

### Rate Limiting

- Each bill check requires an additional API call to Congress.gov
- With default 100ms rate limiting, checking 20 bills adds ~2 seconds
- For large batches, consider:
  - Reducing the initial `limit` parameter
  - Running sync jobs during off-peak hours
  - Implementing background processing

### Example Timing

```
Fetching 20 bills without filtering: ~200ms
Fetching 20 bills with full text filtering: ~2.2 seconds
  - Initial fetch: 200ms
  - 20 text checks: 20 × 100ms = 2 seconds
```

## Use Cases

### AI Bill Summarization

Only bills with full text can be summarized using Chrome's Summarizer API:

```typescript
const { bills } = await getRecentBills(119, {
  limit: 10,
  onlyWithFullText: true, // Ensure text is available for summarization
});

for (const bill of bills) {
  // Now safe to fetch and summarize bill text
  const summary = await summarizeBillWithAI(bill);
}
```

### Legislative Impact Analysis

Impact analysis requires reading the actual bill text:

```typescript
const { bills } = await getRecentBills(119, {
  billType: 's',
  onlyWithFullText: true, // Need full text for impact analysis
});

// Analyze economic, social, environmental impacts
const impacts = await analyzeBillImpacts(bills);
```

### User Bill Reading

When users want to read full bill text:

```typescript
// Get bills user can actually read
const readableBills = await getRecentBills(119, {
  onlyWithFullText: true,
});

// Display to user with "Read Full Text" button enabled
```

## Default Behavior

By default, `onlyWithFullText` is **false** to optimize performance:

```typescript
// These are equivalent - both fetch all bills
await getRecentBills(119, { limit: 20 });
await getRecentBills(119, { limit: 20, onlyWithFullText: false });
```

## Bill Text Versions

Bills can have multiple text versions representing different stages:

- **Introduced (IH/IS)**: Original bill as introduced
- **Engrossed (EH/ES)**: Passed by one chamber
- **Enrolled (ENR)**: Passed by both chambers, sent to President
- **And more...**

The filter checks for **any** text version. If at least one version exists, the bill is included.

## Error Handling

If a bill text check fails (network error, API error), the system:

1. Logs the error
2. Assumes the bill **does not** have full text (conservative approach)
3. Continues checking remaining bills

## Example Response

```json
{
  "bills": [
    {
      "congress": 119,
      "type": "hr",
      "number": "1234",
      "title": "Example Bill with Full Text",
      "latestAction": {
        "actionDate": "2025-10-01",
        "text": "Introduced in House"
      }
    }
  ],
  "pagination": {
    "count": 1
  }
}
```

## Related Documentation

- [Congress.gov API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [Chrome AI Integration Guide](./CHROME_AI_INTEGRATION_GUIDE.md)
- [Bill Sync Service](../lib/services/bill-sync.ts)
