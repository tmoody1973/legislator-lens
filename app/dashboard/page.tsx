import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-4">
          Dashboard
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Civic Engagement</h2>
          <p className="text-gray-600">
            Your personalized legislative feed and civic activity will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}
