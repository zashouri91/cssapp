import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';
import { createSupabaseClient } from '../../../../lib/supabase';
import { UserRole } from '../../../../types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId: requesterId, getToken } = getAuth(req);
    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = await getToken();
    const supabase = createSupabaseClient(token);

    // Check if requester is an admin
    const { data: requester, error: requesterError } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('clerk_id', requesterId)
      .single();

    if (requesterError || !requester || requester.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { email, role, organizationId } = req.body;

    if (!email || !role || !organizationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create invitation using Clerk
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId,
      emailAddress: email,
      role: 'basic_member', // Clerk role - we'll manage detailed roles in our DB
    });

    // Create user record in Supabase
    const { error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          role,
          organization_id: organizationId,
          clerk_id: invitation.id, // Temporary ID until user accepts invitation
        }
      ]);

    if (createError) {
      console.error('Error creating user in Supabase:', createError);
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    return res.status(200).json({ success: true, invitation });
  } catch (error) {
    console.error('Error inviting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
