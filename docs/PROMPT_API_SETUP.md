# Prompt API Setup Guide

The Q&A feature requires the Chrome Prompt API (LanguageModel), which needs an Origin Trial token to work.

## Quick Setup (5 minutes)

### Step 1: Register for Origin Trial

1. Visit: https://developer.chrome.com/origintrials/#/view_trial/3069412294083985409
2. Click **"Register"**
3. Sign in with your Google account

### Step 2: Generate Token for Localhost

1. Enter **Web Origin**: `http://localhost:3000`
2. Click **"Register"**
3. Copy the generated token (long string)

### Step 3: Add Token to Your App

1. Open `.env.local` file (create if it doesn't exist)
2. Add this line:
   ```bash
   NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN=your_token_here
   ```
3. Replace `your_token_here` with the actual token you copied

### Step 4: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Q&A Feature

1. Go to any bill page
2. Click the **"Q&A"** tab
3. Click **"Start Q&A Session"**
4. Ask a question!

## Production Deployment

For production, you'll need a **separate token** for your production domain:

1. Go back to: https://developer.chrome.com/origintrials/#/view_trial/3069412294083985409
2. Click **"Register"** again
3. Enter your production URL (e.g., `https://yourdomain.com`)
4. Add the production token to your hosting platform's environment variables

## Troubleshooting

### "Origin Trial token not configured" Warning

- Check that `.env.local` file exists in the project root
- Verify the variable name is exactly: `NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN`
- Make sure you restarted the dev server after adding the token

### "Model is still initializing" Error

- Open `chrome://components`
- Find "Optimization Guide On Device Model"
- Ensure it's fully downloaded and up to date
- Wait 1-2 minutes after Chrome starts for the model to initialize

### Still Not Working?

Check these Chrome flags:

1. `chrome://flags/#prompt-api-for-gemini-nano` → **Enabled**
2. `chrome://flags/#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
3. Restart Chrome completely after changing flags

## How Origin Trials Work

Origin Trials allow you to use experimental Chrome features in production before they're fully stable. The token:

- Is tied to a specific origin (domain + port)
- Expires after the trial period (usually 6 months)
- Is free and unlimited
- Works for both localhost and production
- Doesn't require Chrome flags when properly configured

## Token Management

### Development Token
- Origin: `http://localhost:3000`
- Stored in: `.env.local` (NOT committed to git)
- Renewed: When trial period expires

### Production Token
- Origin: Your production URL
- Stored in: Hosting platform environment variables
- Renewed: Same as dev token

### Multiple Environments

If you have staging/preview environments, register a token for each:

```bash
# Development
NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN=dev_token_here

# Staging
NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN=staging_token_here

# Production
NEXT_PUBLIC_PROMPT_API_ORIGIN_TRIAL_TOKEN=prod_token_here
```

## Resources

- [Origin Trials Guide](https://developer.chrome.com/docs/web-platform/origin-trials)
- [Prompt API Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [Chrome AI Roadmap](https://developer.chrome.com/docs/ai/built-in)
