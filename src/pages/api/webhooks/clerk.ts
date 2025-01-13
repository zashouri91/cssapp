import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { buffer } from 'micro';
import { supabase } from '@/lib/supabase';
import { NextApiRequest, NextApiResponse } from 'next';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const payload = (await buffer(req)).toString();
    const headers = req.headers;
    const svix_id = headers['svix-id'] as string;
    const svix_timestamp = headers['svix-timestamp'] as string;
    const svix_signature = headers['svix-signature'] as string;

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook payload
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Handle the webhook event
    const eventType = evt.type;
    console.log('Received webhook event:', eventType);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, organization_memberships } = evt.data;
      const email = email_addresses[0]?.email_address;
      const organization_id = organization_memberships?.[0]?.organization.id;

      if (!email) {
        return res.status(400).json({ message: 'No email address found' });
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id,
          email,
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
          organization_id: organization_id || null,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error syncing user to Supabase:', error);
        return res.status(500).json({ message: 'Error syncing user' });
      }

      console.log('Successfully synced user:', id);
    }

    if (eventType === 'organization.created' || eventType === 'organization.updated') {
      const { id, name } = evt.data;

      const { error } = await supabase
        .from('organizations')
        .upsert({
          id,
          name,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error syncing organization to Supabase:', error);
        return res.status(500).json({ message: 'Error syncing organization' });
      }

      console.log('Successfully synced organization:', id);
    }

    if (eventType === 'organizationMembership.created') {
      const { organization, public_user_data } = evt.data;
      
      // Add default role for new organization member
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: public_user_data.user_id,
          organization_id: organization.id,
          role: 'user', // Default role
        });

      if (error && error.code !== '23505') { // Ignore unique constraint violations
        console.error('Error adding default role:', error);
        return res.status(500).json({ message: 'Error adding default role' });
      }

      // Update user's organization_id in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ organization_id: organization.id })
        .eq('id', public_user_data.user_id);

      if (profileError) {
        console.error('Error updating user organization:', profileError);
        return res.status(500).json({ message: 'Error updating user organization' });
      }

      console.log('Successfully added role for user:', public_user_data.user_id);
    }

    return res.status(200).json({ 
      message: 'Webhook processed successfully',
      event: eventType
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
}
