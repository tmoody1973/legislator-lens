// Clerk Webhook Handler
// Syncs Clerk user events with Supabase database

import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If no headers, error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create Svix instance
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error: Could not verify webhook:', err);
    return new Response('Error: Verification error', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const supabase = createAdminSupabaseClient();

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    if (!primaryEmail) {
      return new Response('Error: No primary email found', { status: 400 });
    }

    // Create user in Supabase
    try {
      const { error } = await supabase.from('users').insert({
        clerk_id: id,
        email: primaryEmail.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar_url: image_url || null,
      } as any);

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error: Failed to create user', { status: 500 });
      }

      console.log(`User ${id} created successfully`);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error: Failed to create user', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);

    // Update user in Supabase
    try {
      const { error } = await supabase
        .from('users')
        // @ts-expect-error - Supabase type inference issue
        .update({
          email: primaryEmail?.email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          avatar_url: image_url || null,
        })
        .eq('clerk_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error: Failed to update user', { status: 500 });
      }

      console.log(`User ${id} updated successfully`);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error: Failed to update user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (!id) {
      return new Response('Error: No user ID provided', { status: 400 });
    }

    // Delete user from Supabase (will cascade to related records)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('clerk_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error: Failed to delete user', { status: 500 });
      }

      console.log(`User ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      return new Response('Error: Failed to delete user', { status: 500 });
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}
