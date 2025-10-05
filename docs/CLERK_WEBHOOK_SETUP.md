# Clerk Webhook Setup Guide

This guide will help you configure Clerk webhooks to sync user data with Supabase.

## Your ngrok URL

Your current ngrok tunnel is running at:

**`https://6422dcd325b9.ngrok-free.app`**

This URL forwards to your local development server at `http://localhost:3000`

## Step 1: Configure Clerk Webhook

1. Go to your Clerk Dashboard: https://dashboard.clerk.com/
2. Select your application: **oriented-llama-85**
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**

### Webhook Configuration:

- **Endpoint URL**: `https://6422dcd325b9.ngrok-free.app/api/webhooks/clerk`
- **Description**: Supabase user sync
- **Subscribe to events**:
  - ✅ `user.created`
  - ✅ `user.updated`
  - ✅ `user.deleted`

5. Click **Create**

## Step 2: Copy Webhook Signing Secret

After creating the webhook:

1. Click on your newly created webhook endpoint
2. Find the **Signing Secret** section
3. Click **Reveal** to see the secret
4. Copy the signing secret (starts with `whsec_...`)

## Step 3: Add Secret to Environment Variables

Add the signing secret to your `.env.local` file:

```bash
# Add this to .env.local
CLERK_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

## Step 4: Restart Development Server

After adding the webhook secret, restart your Next.js development server:

```bash
# Kill the current server (Ctrl+C in the terminal running npm run dev)
# Then restart:
npm run dev
```

## Step 5: Test the Webhook

1. Visit http://localhost:3000/sign-up
2. Create a new test account
3. Check your Supabase dashboard:
   - Go to **Table Editor** → **users**
   - You should see a new user record created automatically
4. Check Clerk Dashboard → Webhooks → Your endpoint
   - You should see successful webhook deliveries with status 200

## Troubleshooting

### Webhook Returns 400/500 Error

- Check that `CLERK_WEBHOOK_SECRET` is correctly set in `.env.local`
- Verify the secret matches the one in Clerk Dashboard
- Restart your development server after adding the secret

### User Not Created in Supabase

- Check the browser console for errors
- Check your Next.js terminal for server errors
- Verify Supabase credentials are correct in `.env.local`
- Check Clerk webhook logs for error details

### ngrok URL Changes

The free ngrok URL changes every time ngrok restarts. If your ngrok URL changes:

1. Get the new URL:
   ```bash
   curl -s http://localhost:4040/api/tunnels | grep public_url
   ```

2. Update the webhook endpoint URL in Clerk Dashboard:
   - Go to Webhooks → Click your endpoint → Edit
   - Update the URL with your new ngrok URL
   - Save changes

### Testing Webhooks Manually

You can test individual webhook events in Clerk Dashboard:

1. Go to Webhooks → Your endpoint
2. Click **Send Test Event**
3. Select `user.created` or another event type
4. Click **Send Test**
5. Check the response to verify it worked

## Production Deployment

When deploying to production:

1. Replace ngrok URL with your production domain:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```

2. Generate a new webhook signing secret in production
3. Add the production secret to your deployment environment variables
4. Keep the development webhook endpoint for local testing

## Webhook Security

The webhook endpoint is secured with:

- **Svix signature verification** - Ensures requests come from Clerk
- **Public route exception** - Middleware allows webhook endpoint without auth
- **Admin Supabase client** - Bypasses RLS to create/update/delete users

## Next Steps

Once webhooks are configured:

1. Users will automatically sync to Supabase when they sign up
2. Profile updates in Clerk will update Supabase
3. Deleted users will be removed from Supabase
4. You can build features that rely on the users table being populated

## Additional Resources

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Documentation](https://docs.svix.com/)
- [ngrok Documentation](https://ngrok.com/docs)
