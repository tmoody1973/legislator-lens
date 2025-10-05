'use client';

import { useState } from 'react';
import BillSummary from '@/components/bills/BillSummary';
import { checkSummarizerAvailability } from '@/lib/ai/summarizer';

export default function SummarizerTestPage() {
  const [availability, setAvailability] = useState<any>(null);
  const [testBill, setTestBill] = useState({
    congress: 118,
    billType: 'hr',
    billNumber: 1,
  });
  const [showSummary, setShowSummary] = useState(false);

  async function checkAvailability() {
    const result = await checkSummarizerAvailability();
    setAvailability(result);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chrome Summarizer API Test
          </h1>
          <p className="text-gray-600">
            Test the Chrome Built-in AI Summarizer API integration
          </p>
        </div>

        {/* API Availability Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">1. Check API Availability</h2>
          <button
            onClick={checkAvailability}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Check Summarizer API
          </button>

          {availability && (
            <div className={`mt-4 p-4 rounded-lg ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                {availability.available ? (
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <div className="ml-3">
                  <h3 className={`font-medium ${availability.available ? 'text-green-800' : 'text-red-800'}`}>
                    {availability.available ? 'Summarizer API Available!' : 'Summarizer API Not Available'}
                  </h3>
                  <p className={`text-sm mt-1 ${availability.available ? 'text-green-700' : 'text-red-700'}`}>
                    Status: {availability.status}
                  </p>
                  <p className={`text-sm mt-1 ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
                    {availability.message}
                  </p>
                </div>
              </div>

              {!availability.available && (
                <div className="mt-4 p-3 bg-white rounded border border-red-200">
                  <h4 className="font-semibold text-sm text-red-900 mb-2">How to enable Chrome AI:</h4>
                  <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                    <li>Download Chrome Canary from <a href="https://www.google.com/chrome/canary/" target="_blank" rel="noopener noreferrer" className="underline">google.com/chrome/canary</a></li>
                    <li>Join the Early Preview Program at <a href="https://goo.gle/chrome-ai-dev-preview-join" target="_blank" rel="noopener noreferrer" className="underline">goo.gle/chrome-ai-dev-preview-join</a></li>
                    <li>Navigate to <code className="bg-red-100 px-1 rounded">chrome://flags</code></li>
                    <li>Enable these flags:
                      <ul className="ml-6 mt-1 space-y-0.5">
                        <li>• <code className="bg-red-100 px-1 rounded">#optimization-guide-on-device-model</code></li>
                        <li>• <code className="bg-red-100 px-1 rounded">#prompt-api-for-gemini-nano</code></li>
                        <li>• <code className="bg-red-100 px-1 rounded">#summarization-api-for-gemini-nano</code></li>
                      </ul>
                    </li>
                    <li>Restart Chrome Canary</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bill Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. Select Test Bill</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Congress
              </label>
              <input
                type="number"
                value={testBill.congress}
                onChange={(e) => setTestBill({ ...testBill, congress: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Type
              </label>
              <select
                value={testBill.billType}
                onChange={(e) => setTestBill({ ...testBill, billType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="hr">HR (House)</option>
                <option value="s">S (Senate)</option>
                <option value="hjres">HJRES</option>
                <option value="sjres">SJRES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Number
              </label>
              <input
                type="number"
                value={testBill.billNumber}
                onChange={(e) => setTestBill({ ...testBill, billNumber: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Testing with:</strong> {testBill.billType.toUpperCase()} {testBill.billNumber} from {testBill.congress}th Congress
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Note: Bill must have published text. 118th Congress bills are more likely to have text available.
            </p>
          </div>

          <button
            onClick={() => setShowSummary(true)}
            disabled={!availability?.available}
            className={`mt-4 px-6 py-2 rounded-lg transition-colors ${
              availability?.available
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Generate Summary
          </button>
        </div>

        {/* Summary Display */}
        {showSummary && availability?.available && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">3. AI-Generated Summary</h2>
            <BillSummary
              congress={testBill.congress}
              billType={testBill.billType}
              billNumber={testBill.billNumber}
              summaryTypes={['key-points', 'tl;dr']}
              onError={(error) => {
                console.error('Summary error:', error);
                alert(`Error: ${error.message}`);
              }}
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="prose prose-sm">
            <ol>
              <li>Click "Check Summarizer API" to verify Chrome AI is available</li>
              <li>If not available, follow the setup instructions shown above</li>
              <li>Select a test bill (default is HR 1 from 118th Congress)</li>
              <li>Click "Generate Summary" to test the integration</li>
              <li>The summary will be cached in Supabase for future requests</li>
            </ol>

            <h3 className="text-lg font-semibold mt-6 mb-2">What's Being Tested:</h3>
            <ul>
              <li>Chrome Summarizer API availability detection</li>
              <li>Bill text fetching from Congress.gov</li>
              <li>AI summary generation with multiple types</li>
              <li>Database caching functionality</li>
              <li>Error handling and fallbacks</li>
              <li>UI component rendering</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">Known Good Test Bills:</h3>
            <ul className="text-sm">
              <li><strong>HR 1 (118th Congress)</strong> - Lower Energy Costs Act</li>
              <li><strong>HR 2 (118th Congress)</strong> - Secure the Border Act</li>
              <li><strong>HR 5 (118th Congress)</strong> - Parents Bill of Rights Act</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
