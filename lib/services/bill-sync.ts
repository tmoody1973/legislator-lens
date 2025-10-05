// Bill Sync Service
// Fetches bills from Congress.gov and syncs them to Supabase

import { getRecentBills, transformBillForDatabase, getCurrentCongress } from '@/lib/api/congress';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

/**
 * Sync recent bills from Congress.gov to Supabase
 */
export async function syncRecentBills(
  congress: number = getCurrentCongress(),
  options: {
    limit?: number;
    billTypes?: string[];
    onlyWithFullText?: boolean;
  } = {}
) {
  const { limit = 100, billTypes = ['hr', 's', 'hjres', 'sjres'], onlyWithFullText = false } = options;
  const supabase = createAdminSupabaseClient();

  console.log(`Starting bill sync for Congress ${congress}...`);

  let totalSynced = 0;
  let totalErrors = 0;

  // Fetch bills for each bill type
  for (const billType of billTypes) {
    try {
      console.log(`Fetching ${billType} bills${onlyWithFullText ? ' (with full text)' : ''}...`);
      const { bills } = await getRecentBills(congress, { limit, billType, onlyWithFullText });

      console.log(`Found ${bills.length} ${billType} bills`);

      // Transform and upsert bills
      for (const bill of bills) {
        try {
          const billData = transformBillForDatabase(bill);

          const { error } = await supabase
            .from('bills')
            .upsert(billData as any, {
              onConflict: 'bill_number',
              ignoreDuplicates: false,
            });

          if (error) {
            console.error(`Error upserting bill ${billData.bill_number}:`, error);
            totalErrors++;
          } else {
            totalSynced++;
          }
        } catch (error) {
          console.error(`Error processing bill:`, error);
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${billType} bills:`, error);
      totalErrors++;
    }
  }

  console.log(`Bill sync complete. Synced: ${totalSynced}, Errors: ${totalErrors}`);

  return {
    success: true,
    totalSynced,
    totalErrors,
  };
}

/**
 * Sync a specific bill by congress, type, and number
 */
export async function syncSpecificBill(
  congress: number,
  billType: string,
  billNumber: number
) {
  const supabase = createAdminSupabaseClient();

  try {
    const { getBill } = await import('@/lib/api/congress');
    const bill = await getBill(congress, billType, billNumber);
    const billData = transformBillForDatabase(bill);

    const { error } = await supabase
      .from('bills')
      .upsert(billData as any, {
        onConflict: 'bill_number',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error(`Error upserting bill:`, error);
      return { success: false, error };
    }

    console.log(`Bill ${billData.bill_number} synced successfully`);
    return { success: true, bill: billData };
  } catch (error) {
    console.error(`Error syncing bill:`, error);
    return { success: false, error };
  }
}

/**
 * Get sync statistics
 */
export async function getBillSyncStats() {
  const supabase = createAdminSupabaseClient();

  try {
    // Get total bills count
    const { count: totalBills, error: countError } = await supabase
      .from('bills')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get bills by congress
    const { data: billsByCongress, error: congressError } = await supabase
      .from('bills')
      .select('congress')
      .order('congress', { ascending: false });

    if (congressError) throw congressError;

    // Count bills per congress
    const congressCounts = (billsByCongress || []).reduce((acc: Record<number, number>, { congress }) => {
      acc[congress] = (acc[congress] || 0) + 1;
      return acc;
    }, {});

    // Get most recent sync (last updated bill)
    const { data: recentBill, error: recentError } = await supabase
      .from('bills')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (recentError && recentError.code !== 'PGRST116') throw recentError;

    return {
      success: true,
      stats: {
        totalBills: totalBills || 0,
        billsByCongress: congressCounts,
        // @ts-expect-error - Supabase type inference issue with single()
        lastSync: recentBill?.updated_at || null,
      },
    };
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return { success: false, error };
  }
}
