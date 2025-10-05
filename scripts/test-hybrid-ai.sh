#!/bin/bash

# Hybrid AI Test Script
# Tests Gemini and Guardian API endpoints

echo "🧪 Testing Hybrid AI Endpoints"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Availability
echo -e "${BLUE}Test 1: Checking AI Availability${NC}"
echo "GET $BASE_URL/api/bills/analyze"
echo ""

curl -s "$BASE_URL/api/bills/analyze" | jq '.' || echo -e "${RED}Failed to parse JSON${NC}"

echo ""
echo "---"
echo ""

# Test 2: Gemini Historical Analysis
echo -e "${BLUE}Test 2: Gemini Historical Analysis${NC}"
echo "POST $BASE_URL/api/bills/historical"
echo ""

HISTORICAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bills/historical" \
  -H "Content-Type: application/json" \
  -d '{
    "billId": "hr-1234-118",
    "billTitle": "Affordable Housing Access Act",
    "billSummary": "A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families",
    "provisions": [
      "Establish affordable housing development grants for underserved communities",
      "Expand rental assistance programs by $5 billion annually",
      "Provide up to $25,000 down payment assistance for first-time homebuyers",
      "Increase infrastructure funding to support housing development"
    ]
  }')

echo "$HISTORICAL_RESPONSE" | jq '.' || echo -e "${RED}Failed - Check error message:${NC}\n$HISTORICAL_RESPONSE"

echo ""
echo "---"
echo ""

# Test 3: Guardian News Correlation
echo -e "${BLUE}Test 3: Guardian News Correlation${NC}"
echo "POST $BASE_URL/api/bills/news"
echo ""

NEWS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bills/news" \
  -H "Content-Type: application/json" \
  -d '{
    "billId": "hr-1234-118",
    "billTitle": "Affordable Housing Access Act",
    "billSummary": "A bill to establish grants for affordable housing development and expand housing assistance programs",
    "keywords": ["housing", "affordable housing", "rental assistance", "homeownership"],
    "billIntroducedDate": "2024-03-15"
  }')

echo "$NEWS_RESPONSE" | jq '.' || echo -e "${RED}Failed - Check error message:${NC}\n$NEWS_RESPONSE"

echo ""
echo "---"
echo ""

# Test 4: Test Caching (run same request again)
echo -e "${BLUE}Test 4: Testing Cache (Historical Analysis Again)${NC}"
echo "POST $BASE_URL/api/bills/historical (should be faster)"
echo ""

CACHED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bills/historical" \
  -H "Content-Type: application/json" \
  -d '{
    "billId": "hr-1234-118",
    "billTitle": "Affordable Housing Access Act",
    "billSummary": "A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families",
    "provisions": [
      "Establish affordable housing development grants for underserved communities",
      "Expand rental assistance programs by $5 billion annually",
      "Provide up to $25,000 down payment assistance for first-time homebuyers",
      "Increase infrastructure funding to support housing development"
    ]
  }')

if echo "$CACHED_RESPONSE" | jq -e '.fromCache == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Cache is working! Response was served from cache${NC}"
else
  echo -e "${YELLOW}⚠ Response not from cache (may be first run)${NC}"
fi

echo "$CACHED_RESPONSE" | jq '{fromCache, cachedAt, processingTime}' || echo -e "${RED}Failed${NC}"

echo ""
echo "---"
echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================================"
echo ""

# Check if Gemini worked
if echo "$HISTORICAL_RESPONSE" | jq -e '.similarBills' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Gemini API: Working${NC}"
  SIMILAR_BILLS_COUNT=$(echo "$HISTORICAL_RESPONSE" | jq '.similarBills | length')
  echo "  Found $SIMILAR_BILLS_COUNT similar historical bills"
else
  echo -e "${RED}✗ Gemini API: Failed or not configured${NC}"
fi

# Check if Guardian worked
if echo "$NEWS_RESPONSE" | jq -e '.articles' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Guardian API: Working${NC}"
  ARTICLES_COUNT=$(echo "$NEWS_RESPONSE" | jq '.totalResults // 0')
  echo "  Found $ARTICLES_COUNT related news articles"
else
  echo -e "${RED}✗ Guardian API: Failed or not configured${NC}"
fi

# Check if caching worked
if echo "$CACHED_RESPONSE" | jq -e '.fromCache == true' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Database Caching: Working${NC}"
else
  echo -e "${YELLOW}⚠ Database Caching: Check database tables${NC}"
fi

echo ""
echo "================================"
echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. Check the detailed JSON responses above"
echo "2. Verify data in Supabase tables:"
echo "   - bill_historical_analyses"
echo "   - bill_news_correlations"
echo "3. When Chrome AI is available, test at: http://localhost:3000/test/hybrid-ai"
echo ""
