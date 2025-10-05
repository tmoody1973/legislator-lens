// Test script for Congress.gov API integration
// Run with: npx tsx scripts/test-congress-api.ts

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  getRecentBills,
  getBill,
  getCurrentMembers,
  getCurrentCongress,
  transformBillForDatabase,
} from '../lib/api/congress';

async function testCongressAPI() {
  console.log('🧪 Testing Congress.gov API Integration\n');
  console.log('='.repeat(60));

  // Check API key
  if (!process.env.CONGRESS_API_KEY) {
    console.error('\n❌ ERROR: CONGRESS_API_KEY environment variable not set!');
    console.log('Please add it to your .env.local file');
    process.exit(1);
  }

  console.log('\n✅ CONGRESS_API_KEY found');

  const currentCongress = getCurrentCongress();
  console.log(`📅 Current Congress: ${currentCongress}`);

  // Test 1: Fetch recent bills
  console.log('\n\n📜 Test 1: Fetching recent House bills...');
  console.log('-'.repeat(60));
  try {
    const { bills, pagination } = await getRecentBills(currentCongress, {
      limit: 5,
      billType: 'hr',
    });

    console.log(`✅ Found ${bills.length} bills (Total: ${pagination.count})`);

    if (bills.length > 0) {
      const firstBill = bills[0];
      console.log(`\nFirst bill:`);
      console.log(`  - Number: ${firstBill.type.toUpperCase()} ${firstBill.number}`);
      console.log(`  - Title: ${firstBill.title.substring(0, 80)}...`);
      console.log(`  - Latest Action: ${firstBill.latestAction?.text?.substring(0, 60)}...`);
      console.log(`  - Date: ${firstBill.latestAction?.actionDate}`);
    }
  } catch (error) {
    console.error('❌ Error fetching bills:', error);
  }

  // Test 2: Fetch specific bill
  console.log('\n\n🔍 Test 2: Fetching specific bill details...');
  console.log('-'.repeat(60));
  try {
    // Fetch H.R. 1 from current congress
    const bill = await getBill(currentCongress, 'hr', 1);

    console.log(`✅ Retrieved bill: ${bill.type.toUpperCase()} ${bill.number}`);
    console.log(`  - Title: ${bill.title}`);
    console.log(`  - Origin Chamber: ${bill.originChamber}`);
    console.log(`  - Policy Area: ${bill.policyArea?.name || 'N/A'}`);
    console.log(`  - Sponsors: ${bill.sponsors?.length || 0}`);
    console.log(`  - Cosponsors: ${bill.cosponsors?.length || 0}`);

    // Test data transformation
    console.log('\n  📊 Testing data transformation...');
    const transformed = transformBillForDatabase(bill);
    console.log(`  ✅ Transformed to database format:`);
    console.log(`    - bill_number: ${transformed.bill_number}`);
    console.log(`    - bill_type: ${transformed.bill_type}`);
    console.log(`    - sponsor_name: ${transformed.sponsor_name}`);
    console.log(`    - cosponsors_count: ${transformed.cosponsors_count}`);
  } catch (error) {
    console.error('❌ Error fetching specific bill:', error);
  }

  // Test 3: Fetch members
  console.log('\n\n👥 Test 3: Fetching Congress members...');
  console.log('-'.repeat(60));
  try {
    const members = await getCurrentMembers(currentCongress, 'senate');

    console.log(`✅ Found ${members.length} Senators`);

    if (members.length > 0) {
      const firstMember = members[0];
      console.log(`\nFirst Senator:`);
      console.log(`  - Name: ${firstMember.firstName} ${firstMember.lastName}`);
      console.log(`  - Party: ${firstMember.party}`);
      console.log(`  - State: ${firstMember.state}`);
      console.log(`  - Bioguide ID: ${firstMember.bioguideId}`);
    }
  } catch (error) {
    console.error('❌ Error fetching members:', error);
  }

  // Test 4: Test full-text filtering (note: this is slow!)
  console.log('\n\n📖 Test 4: Testing full-text filtering...');
  console.log('-'.repeat(60));
  console.log('⚠️  Warning: This test makes multiple API calls and may take time.');
  console.log('Fetching 3 bills with full text check...\n');

  try {
    const { bills } = await getRecentBills(currentCongress, {
      limit: 3,
      billType: 's',
      onlyWithFullText: true,
    });

    console.log(`✅ Found ${bills.length} Senate bills with full text`);

    bills.forEach((bill, i) => {
      console.log(`\n  ${i + 1}. ${bill.type.toUpperCase()} ${bill.number}`);
      console.log(`     ${bill.title.substring(0, 70)}...`);
    });
  } catch (error) {
    console.error('❌ Error testing full-text filtering:', error);
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('✅ Congress.gov API tests complete!\n');
}

// Run tests
testCongressAPI().catch(console.error);
