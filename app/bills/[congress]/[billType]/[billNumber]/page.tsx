import { notFound } from 'next/navigation';
import BillSummary from '@/components/bills/BillSummary';
import BillQA from '@/components/bills/BillQA';
import BillHistoricalAnalysis from '@/components/bills/BillHistoricalAnalysis';
import BillNewsCoverage from '@/components/bills/BillNewsCoverage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BillPageProps {
  params: Promise<{
    congress: string;
    billType: string;
    billNumber: string;
  }>;
}

// Fetch bill data from Congress.gov API
async function getBillData(congress: number, billType: string, billNumber: number) {
  const apiKey = process.env.CONGRESS_API_KEY;

  if (!apiKey) {
    throw new Error('Congress API key not configured');
  }

  const response = await fetch(
    `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}?api_key=${apiKey}`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.bill;
}

export default async function BillPage({ params }: BillPageProps) {
  // Next.js 15 requires awaiting params
  const resolvedParams = await params;
  const congress = parseInt(resolvedParams.congress);
  const billNumber = parseInt(resolvedParams.billNumber);
  const billType = resolvedParams.billType.toLowerCase();

  // Fetch bill data
  const bill = await getBillData(congress, billType, billNumber);

  if (!bill) {
    notFound();
  }

  // Extract data for AI components
  const billId = `${billType}-${billNumber}-${congress}`;
  const billTitle = bill.title || `${billType.toUpperCase()} ${billNumber}`;
  const billSummary =
    bill.summary?.text ||
    bill.latestAction?.text ||
    'A bill in the United States Congress';

  // Extract provisions from bill text or actions
  const provisions =
    (Array.isArray(bill.textVersions)
      ? bill.textVersions.map((v: any) => v.type || '').filter(Boolean)
      : null) ||
    (Array.isArray(bill.actions)
      ? bill.actions
          .slice(0, 5)
          .map((a: any) => a.text)
          .filter(Boolean)
      : null) ||
    ['Legislative provisions not yet available'];

  // Extract keywords from title and summary
  const keywords = [
    ...new Set([
      ...(billTitle.toLowerCase().split(' ').filter((w: string) => w.length > 4) || []),
      ...(billSummary.toLowerCase().split(' ').filter((w: string) => w.length > 5) || []),
    ]),
  ].slice(0, 5);

  const billIntroducedDate = bill.introducedDate;

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Bill Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{billTitle}</h1>
          {bill.latestAction?.actionDate && (
            <span className="text-sm text-muted-foreground">
              {new Date(bill.latestAction.actionDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Bill Metadata */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="text-sm">
            <span className="font-medium">Congress:</span> {congress}th
          </div>
          <div className="text-sm">
            <span className="font-medium">Type:</span> {billType.toUpperCase()}
          </div>
          <div className="text-sm">
            <span className="font-medium">Number:</span> {billNumber}
          </div>
          {bill.sponsors && bill.sponsors[0] && (
            <div className="text-sm">
              <span className="font-medium">Sponsor:</span>{' '}
              {bill.sponsors[0].firstName} {bill.sponsors[0].lastName} (
              {bill.sponsors[0].party}-{bill.sponsors[0].state})
            </div>
          )}
        </div>

        {/* Latest Action */}
        {bill.latestAction && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm">
              <span className="font-medium">Latest Action:</span> {bill.latestAction.text}
            </p>
          </div>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="summary">AI Summary</TabsTrigger>
          <TabsTrigger value="qa">Q&A</TabsTrigger>
          <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
          <TabsTrigger value="news">News Coverage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="prose max-w-none">
            <h2>Bill Summary</h2>
            <p>{billSummary}</p>

            {bill.policyArea && (
              <div className="mt-4">
                <h3>Policy Area</h3>
                <p>{bill.policyArea.name}</p>
              </div>
            )}

            {bill.subjects?.legislativeSubjects && bill.subjects.legislativeSubjects.length > 0 && (
              <div className="mt-4">
                <h3>Legislative Subjects</h3>
                <ul>
                  {bill.subjects.legislativeSubjects.map((subject: any, idx: number) => (
                    <li key={idx}>{subject.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <BillSummary
            congress={congress}
            billType={billType}
            billNumber={billNumber}
            summaryTypes={['key-points', 'tl;dr']}
          />
        </TabsContent>

        <TabsContent value="qa" className="space-y-6">
          <BillQA
            congress={congress}
            billType={billType}
            billNumber={billNumber}
            billTitle={billTitle}
            billSummary={billSummary}
          />
        </TabsContent>

        <TabsContent value="historical" className="space-y-6">
          <BillHistoricalAnalysis
            billId={billId}
            billTitle={billTitle}
            billSummary={billSummary}
            provisions={provisions}
          />
        </TabsContent>

        <TabsContent value="news" className="space-y-6">
          <BillNewsCoverage
            billId={billId}
            billTitle={billTitle}
            billSummary={billSummary}
            keywords={keywords}
            billIntroducedDate={billIntroducedDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
