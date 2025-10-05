#!/usr/bin/env node

/**
 * Hybrid AI Test Script (Node.js version)
 * Tests Gemini and Guardian API endpoints with detailed output
 */

const BASE_URL = 'http://localhost:3000';

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, url, method = 'GET', body = null) {
  log(`\n${name}`, 'blue');
  log(`${method} ${url}`);
  log('');

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      log(`✗ Failed (${response.status})`, 'red');
      console.log(JSON.stringify(data, null, 2));
      return null;
    }

    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return null;
  }
}

async function runTests() {
  log('\n🧪 Testing Hybrid AI Endpoints', 'blue');
  log('================================\n');

  // Test 1: Check Availability
  const availability = await testEndpoint(
    'Test 1: Checking AI Availability',
    `${BASE_URL}/api/bills/analyze`
  );

  log('\n---');

  // Test 2: Gemini Historical Analysis
  const historicalData = await testEndpoint(
    'Test 2: Gemini Historical Analysis',
    `${BASE_URL}/api/bills/historical`,
    'POST',
    {
      billId: 'hr-1234-118',
      billTitle: 'Affordable Housing Access Act',
      billSummary:
        'A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families',
      provisions: [
        'Establish affordable housing development grants for underserved communities',
        'Expand rental assistance programs by $5 billion annually',
        'Provide up to $25,000 down payment assistance for first-time homebuyers',
        'Increase infrastructure funding to support housing development',
      ],
    }
  );

  log('\n---');

  // Test 3: Guardian News Correlation
  const newsData = await testEndpoint(
    'Test 3: Guardian News Correlation',
    `${BASE_URL}/api/bills/news`,
    'POST',
    {
      billId: 'hr-1234-118',
      billTitle: 'Affordable Housing Access Act',
      billSummary:
        'A bill to establish grants for affordable housing development and expand housing assistance programs',
      keywords: ['housing', 'affordable housing', 'rental assistance', 'homeownership'],
      billIntroducedDate: '2024-03-15',
    }
  );

  log('\n---');

  // Test 4: Test Caching
  const cachedData = await testEndpoint(
    'Test 4: Testing Cache (Historical Analysis Again)',
    `${BASE_URL}/api/bills/historical`,
    'POST',
    {
      billId: 'hr-1234-118',
      billTitle: 'Affordable Housing Access Act',
      billSummary:
        'A bill to establish grants for affordable housing development and expand housing assistance programs for low-income families',
      provisions: [
        'Establish affordable housing development grants for underserved communities',
        'Expand rental assistance programs by $5 billion annually',
        'Provide up to $25,000 down payment assistance for first-time homebuyers',
        'Increase infrastructure funding to support housing development',
      ],
    }
  );

  if (cachedData?.fromCache) {
    log('\n✓ Cache is working! Response was served from cache', 'green');
  } else {
    log('\n⚠ Response not from cache (may be first run)', 'yellow');
  }

  // Summary
  log('\n\n📊 Test Summary', 'blue');
  log('================================\n');

  // Check Gemini
  if (historicalData?.similarBills) {
    log('✓ Gemini API: Working', 'green');
    log(`  Found ${historicalData.similarBills.length} similar historical bills`);
  } else {
    log('✗ Gemini API: Failed or not configured', 'red');
  }

  // Check Guardian
  if (newsData?.articles) {
    log('✓ Guardian API: Working', 'green');
    log(`  Found ${newsData.totalResults || 0} related news articles`);
  } else {
    log('✗ Guardian API: Failed or not configured', 'red');
  }

  // Check Caching
  if (cachedData?.fromCache) {
    log('✓ Database Caching: Working', 'green');
  } else {
    log('⚠ Database Caching: Check database tables', 'yellow');
  }

  log('\n================================\n');
  log('💡 Next Steps:', 'blue');
  log('1. Check the detailed JSON responses above');
  log('2. Verify data in Supabase tables:');
  log('   - bill_historical_analyses');
  log('   - bill_news_correlations');
  log('3. When Chrome AI is available, test at: http://localhost:3000/test/hybrid-ai');
  log('');
}

// Run tests
runTests().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
