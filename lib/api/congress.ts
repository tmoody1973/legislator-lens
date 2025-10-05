// Congress.gov API Client
// Official API documentation: https://api.congress.gov/

const CONGRESS_API_BASE = 'https://api.congress.gov/v3';
const API_KEY = process.env.CONGRESS_API_KEY;

if (!API_KEY) {
  console.warn('CONGRESS_API_KEY not set - Congress.gov API calls will fail');
}

// Rate limiting: Congress.gov allows reasonable rate limits
// We'll implement client-side throttling to be respectful
const REQUEST_DELAY = 100; // 100ms between requests
let lastRequestTime = 0;

/**
 * Rate-limited fetch wrapper
 */
async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < REQUEST_DELAY) {
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Congress API error: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Build API URL with parameters
 */
function buildUrl(endpoint: string, params: Record<string, string | number> = {}): string {
  const url = new URL(`${CONGRESS_API_BASE}${endpoint}`);

  // Add API key
  url.searchParams.append('api_key', API_KEY || '');

  // Add format
  url.searchParams.append('format', 'json');

  // Add other params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url.toString();
}

// =====================================================
// BILL TYPES
// =====================================================

export interface CongressBill {
  congress: number;
  type: string;
  number: string;
  title: string;
  originChamber: string;
  updateDate: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  sponsors?: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    party: string;
    state: string;
  }>;
  cosponsors?: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    party: string;
    state: string;
  }>;
  policyArea?: {
    name: string;
  };
  subjects?: Array<{
    name: string;
  }>;
  summaries?: Array<{
    versionCode: string;
    actionDate: string;
    actionDesc: string;
    text: string;
  }>;
}

export interface BillsResponse {
  bills: CongressBill[];
  pagination: {
    count: number;
    next?: string;
  };
}

// =====================================================
// BILL QUERIES
// =====================================================

/**
 * Helper function to check if a bill has full text available
 */
async function billHasFullText(
  congress: number,
  billType: string,
  billNumber: number
): Promise<boolean> {
  try {
    const textVersions = await getBillText(congress, billType, billNumber);
    return textVersions.length > 0;
  } catch (error) {
    console.error(`Error checking text for bill ${billType}${billNumber}:`, error);
    return false;
  }
}

/**
 * Filter bills array to only include bills with full text
 */
async function filterBillsWithFullText(
  bills: CongressBill[],
  congress: number
): Promise<CongressBill[]> {
  const billsWithText: CongressBill[] = [];

  for (const bill of bills) {
    const hasText = await billHasFullText(congress, bill.type, parseInt(bill.number));
    if (hasText) {
      billsWithText.push(bill);
    }
  }

  return billsWithText;
}

/**
 * Get recent bills from a specific congress
 */
export async function getRecentBills(
  congress: number = 119,
  options: {
    limit?: number;
    offset?: number;
    billType?: string;
    onlyWithFullText?: boolean;
  } = {}
): Promise<BillsResponse> {
  const { limit = 20, offset = 0, billType, onlyWithFullText = false } = options;

  const endpoint = billType
    ? `/bill/${congress}/${billType}`
    : `/bill/${congress}`;

  const params: Record<string, string | number> = {
    limit,
    offset,
  };

  const url = buildUrl(endpoint, params);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  let bills = data.bills || [];

  // Filter for bills with full text if requested
  if (onlyWithFullText) {
    bills = await filterBillsWithFullText(bills, congress);
  }

  return {
    bills,
    pagination: data.pagination || { count: 0 },
  };
}

/**
 * Get a specific bill by congress, type, and number
 */
export async function getBill(
  congress: number,
  billType: string,
  billNumber: number
): Promise<CongressBill> {
  const url = buildUrl(`/bill/${congress}/${billType}/${billNumber}`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.bill;
}

/**
 * Get bill summaries
 */
export async function getBillSummaries(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  versionCode: string;
  actionDate: string;
  actionDesc: string;
  text: string;
}>> {
  const url = buildUrl(`/bill/${congress}/${billType}/${billNumber}/summaries`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.summaries || [];
}

/**
 * Get bill text
 */
export async function getBillText(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  type: string;
  date: string;
  formats: Array<{
    type: string;
    url: string;
  }>;
}>> {
  const url = buildUrl(`/bill/${congress}/${billType}/${billNumber}/text`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.textVersions || [];
}

/**
 * Get bill actions (legislative history)
 */
export async function getBillActions(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  actionDate: string;
  text: string;
  type: string;
  actionCode?: string;
  sourceSystem: {
    code: number;
    name: string;
  };
}>> {
  const url = buildUrl(`/bill/${congress}/${billType}/${billNumber}/actions`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.actions || [];
}

/**
 * Get bill cosponsors
 */
export async function getBillCosponsors(
  congress: number,
  billType: string,
  billNumber: number
): Promise<Array<{
  bioguideId: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  sponsorshipDate: string;
}>> {
  const url = buildUrl(`/bill/${congress}/${billType}/${billNumber}/cosponsors`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.cosponsors || [];
}

/**
 * Search bills by keyword
 */
export async function searchBills(
  query: string,
  options: {
    congress?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<BillsResponse> {
  const { congress = 119, limit = 20, offset = 0 } = options;

  const params: Record<string, string | number> = {
    query,
    limit,
    offset,
  };

  const url = buildUrl(`/bill/${congress}`, params);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return {
    bills: data.bills || [],
    pagination: data.pagination || { count: 0 },
  };
}

// =====================================================
// MEMBER QUERIES
// =====================================================

export interface CongressMember {
  bioguideId: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: number;
  terms: Array<{
    chamber: string;
    startYear: number;
    endYear: number;
  }>;
}

/**
 * Get current members of Congress
 */
export async function getCurrentMembers(
  congress: number = 119,
  chamber?: 'house' | 'senate'
): Promise<CongressMember[]> {
  const endpoint = chamber
    ? `/member/congress/${congress}/${chamber}`
    : `/member/congress/${congress}`;

  const url = buildUrl(endpoint);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.members || [];
}

/**
 * Get a specific member by bioguide ID
 */
export async function getMember(bioguideId: string): Promise<CongressMember> {
  const url = buildUrl(`/member/${bioguideId}`);
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.member;
}

/**
 * Get members by state
 */
export async function getMembersByState(
  state: string,
  congress: number = 119
): Promise<CongressMember[]> {
  const url = buildUrl(`/member/congress/${congress}`, { state });
  const response = await rateLimitedFetch(url);
  const data = await response.json();

  return data.members || [];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Transform Congress.gov bill to our database format
 */
export function transformBillForDatabase(bill: CongressBill) {
  const sponsor = bill.sponsors?.[0];

  return {
    bill_number: `${bill.type.toLowerCase()}-${bill.number}-${bill.congress}`,
    bill_type: bill.type.toLowerCase() as any,
    congress: bill.congress,
    title: bill.title,
    short_title: bill.title.length > 200 ? bill.title.substring(0, 200) + '...' : bill.title,
    official_title: bill.title,
    summary: bill.summaries?.[0]?.text || null,
    status: 'introduced',
    introduced_date: bill.latestAction?.actionDate || null,
    latest_action_date: bill.latestAction?.actionDate || null,
    latest_action_text: bill.latestAction?.text || null,
    sponsor_name: sponsor ? `${sponsor.firstName} ${sponsor.lastName}` : null,
    sponsor_party: sponsor?.party || null,
    sponsor_state: sponsor?.state || null,
    sponsor_bioguide_id: sponsor?.bioguideId || null,
    cosponsors_count: bill.cosponsors?.length || 0,
    cosponsors: bill.cosponsors?.map(c => ({
      name: `${c.firstName} ${c.lastName}`,
      party: c.party,
      state: c.state,
      bioguide_id: c.bioguideId,
    })) || [],
    policy_areas: bill.policyArea ? [bill.policyArea.name] : [],
    subjects: Array.isArray(bill.subjects) ? bill.subjects.map(s => s.name) : [],
    congress_gov_url: `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type.toLowerCase()}-bill/${bill.number}`,
  };
}

/**
 * Get current congress number
 */
export function getCurrentCongress(): number {
  const currentYear = new Date().getFullYear();
  // 119th Congress: 2025-2026
  // Each congress is 2 years, starting odd years
  // Formula: congress = ((year - 1789) / 2) + 1
  return Math.floor((currentYear - 1789) / 2) + 1;
}
