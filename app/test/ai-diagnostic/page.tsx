'use client';

import { useState } from 'react';

export default function AIDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  async function runDiagnostics() {
    setChecking(true);
    const results: any = {
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Check if 'ai' exists in window
    results.checks.windowAI = 'ai' in window;

    if ('ai' in window) {
      const ai = (window as any).ai;

      // List all available AI APIs
      results.checks.availableAPIs = Object.keys(ai);

      // Check each API
      const apis = ['summarizer', 'languageModel', 'writer', 'rewriter', 'translator'];

      for (const apiName of apis) {
        if (apiName in ai) {
          results.checks[apiName] = {
            exists: true,
            hasCapabilities: typeof ai[apiName].capabilities === 'function',
            hasCreate: typeof ai[apiName].create === 'function',
          };

          // Try to get capabilities
          if (typeof ai[apiName].capabilities === 'function') {
            try {
              const caps = await ai[apiName].capabilities();
              results.checks[apiName].capabilities = caps;
            } catch (error) {
              results.checks[apiName].capabilitiesError = error instanceof Error ? error.message : String(error);
            }
          }

          // For older API versions, try availability() instead
          if (typeof ai[apiName].availability === 'function') {
            try {
              const avail = await ai[apiName].availability();
              results.checks[apiName].availability = avail;
            } catch (error) {
              results.checks[apiName].availabilityError = error instanceof Error ? error.message : String(error);
            }
          }
        } else {
          results.checks[apiName] = {
            exists: false,
          };
        }
      }
    }

    setDiagnostics(results);
    setChecking(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chrome AI Diagnostics
          </h1>
          <p className="text-gray-600 mb-4">
            Detailed diagnostics for Chrome Built-in AI APIs
          </p>

          <button
            onClick={runDiagnostics}
            disabled={checking}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:bg-gray-300"
          >
            {checking ? 'Checking...' : 'Run Diagnostics'}
          </button>
        </div>

        {diagnostics && (
          <>
            {/* Browser Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Browser Information</h2>
              <div className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto">
                {diagnostics.browser}
              </div>
            </div>

            {/* Window.ai Check */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">window.ai Detection</h2>
              <div className={`p-4 rounded-lg ${diagnostics.checks.windowAI ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {diagnostics.checks.windowAI ? (
                  <div className="flex items-center text-green-800">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">window.ai is available</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-800">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium">window.ai is NOT available</span>
                  </div>
                )}
              </div>

              {diagnostics.checks.windowAI && diagnostics.checks.availableAPIs && (
                <div className="mt-3">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Available APIs in window.ai:</h3>
                  <div className="flex flex-wrap gap-2">
                    {diagnostics.checks.availableAPIs.map((api: string) => (
                      <span key={api} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {api}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* API-specific checks */}
            {['summarizer', 'languageModel', 'writer', 'rewriter', 'translator'].map((apiName) => (
              <div key={apiName} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-3 capitalize">{apiName} API</h2>

                {diagnostics.checks[apiName] ? (
                  <div className="space-y-3">
                    {/* Exists check */}
                    <div className={`p-3 rounded ${diagnostics.checks[apiName].exists ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className="font-medium">
                        {diagnostics.checks[apiName].exists ? '✅ API exists' : '❌ API not found'}
                      </span>
                    </div>

                    {diagnostics.checks[apiName].exists && (
                      <>
                        {/* Methods */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded text-sm ${diagnostics.checks[apiName].hasCapabilities ? 'bg-green-50' : 'bg-gray-50'}`}>
                            {diagnostics.checks[apiName].hasCapabilities ? '✅' : '❌'} capabilities()
                          </div>
                          <div className={`p-2 rounded text-sm ${diagnostics.checks[apiName].hasCreate ? 'bg-green-50' : 'bg-gray-50'}`}>
                            {diagnostics.checks[apiName].hasCreate ? '✅' : '❌'} create()
                          </div>
                        </div>

                        {/* Capabilities result */}
                        {diagnostics.checks[apiName].capabilities && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Capabilities:</h4>
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                              {JSON.stringify(diagnostics.checks[apiName].capabilities, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Availability result (fallback) */}
                        {diagnostics.checks[apiName].availability && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Availability:</h4>
                            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                              {JSON.stringify(diagnostics.checks[apiName].availability, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Errors */}
                        {diagnostics.checks[apiName].capabilitiesError && (
                          <div className="bg-red-50 p-3 rounded">
                            <h4 className="font-semibold text-sm text-red-800 mb-1">Capabilities Error:</h4>
                            <p className="text-xs text-red-700">{diagnostics.checks[apiName].capabilitiesError}</p>
                          </div>
                        )}

                        {diagnostics.checks[apiName].availabilityError && (
                          <div className="bg-red-50 p-3 rounded">
                            <h4 className="font-semibold text-sm text-red-800 mb-1">Availability Error:</h4>
                            <p className="text-xs text-red-700">{diagnostics.checks[apiName].availabilityError}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No data available</p>
                )}
              </div>
            ))}

            {/* Full JSON */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-3">Full Diagnostic Data</h2>
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </div>

            {/* Troubleshooting */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-3">Troubleshooting Steps</h2>
              <ol className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Verify you're using <strong>Chrome Canary</strong> (not regular Chrome)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Check <code className="bg-yellow-100 px-1 rounded">chrome://version</code> - should show "Canary"</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Go to <code className="bg-yellow-100 px-1 rounded">chrome://flags</code> and enable:
                    <ul className="ml-4 mt-1 space-y-0.5">
                      <li>• Optimization Guide On Device Model</li>
                      <li>• Prompt API for Gemini Nano</li>
                      <li>• Summarization API for Gemini Nano</li>
                    </ul>
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span><strong>Restart Chrome Canary completely</strong> (not just reload)</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">5.</span>
                  <span>Go to <code className="bg-yellow-100 px-1 rounded">chrome://components</code> and check if "Optimization Guide On Device Model" is present and up to date</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">6.</span>
                  <span>The AI model may need to download (can be 1-2 GB). Check your internet connection.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">7.</span>
                  <span>Try opening DevTools Console (F12) and typing: <code className="bg-yellow-100 px-1 rounded">await ai.summarizer.capabilities()</code></span>
                </li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
