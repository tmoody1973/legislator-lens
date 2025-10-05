import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

// Sample recent bills for demo
const recentBills = [
  {
    congress: 118,
    billType: 'hr',
    billNumber: 1234,
    title: 'Affordable Housing Access Act',
    sponsor: 'Rep. Smith (D-CA)',
    date: '2024-03-15',
    status: 'In Committee',
  },
  {
    congress: 118,
    billType: 'hr',
    billNumber: 5678,
    title: 'Green Energy Investment Act',
    sponsor: 'Rep. Johnson (D-NY)',
    date: '2024-02-28',
    status: 'Passed House',
  },
  {
    congress: 118,
    billType: 's',
    billNumber: 910,
    title: 'Healthcare Reform Act',
    sponsor: 'Sen. Williams (D-MA)',
    date: '2024-01-10',
    status: 'In Senate',
  },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Welcome back, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Bills Tracked</CardTitle>
              <CardDescription>Bills you're following</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Cloud AI insights generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>News Articles</CardTitle>
              <CardDescription>Related coverage found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">47</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
            <CardDescription>
              Explore bills with AI-powered historical analysis and news coverage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBills.map((bill) => (
                <Link
                  key={`${bill.billType}-${bill.billNumber}`}
                  href={`/bills/${bill.congress}/${bill.billType}/${bill.billNumber}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold group-hover:underline">{bill.title}</h3>
                        <Badge variant="outline">
                          {bill.billType.toUpperCase()} {bill.billNumber}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{bill.sponsor}</span>
                        <span>•</span>
                        <span>{new Date(bill.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{bill.status}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
