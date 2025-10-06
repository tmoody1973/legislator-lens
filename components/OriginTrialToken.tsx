/**
 * Origin Trial Token for Prompt API
 *
 * The Prompt API (LanguageModel) requires an Origin Trial token.
 * Register at: https://developer.chrome.com/origintrials/#/view_trial/3069412294083985409
 *
 * Steps:
 * 1. Go to the URL above
 * 2. Click "Register"
 * 3. Enter your origin (e.g., http://localhost:3000 for local development)
 * 4. Copy the generated token
 * 5. Add to .env.local: NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN=your_token_here
 *
 * Note: You'll need separate tokens for:
 * - localhost (http://localhost:3000)
 * - Production domain (https://yourdomain.com)
 */
export default function OriginTrialToken() {
  const token = process.env.NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN;

  // Only render if token is available
  if (!token) {
    console.warn('⚠️ Prompt API Origin Trial token not configured. Set NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN in .env.local');
    return null;
  }

  return (
    <meta
      httpEquiv="origin-trial"
      content={token}
    />
  );
}
