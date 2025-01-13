import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';
import { createSupabaseClient } from '../../../../lib/supabase';
import { UserRole } from '../../../../types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
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

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Remove user from organization in Clerk
    await clerkClient.organizations.removeOrganizationMember({
      organizationId: requester.organization_id,
      userId,
    });

    // Update user record in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ organization_id: null })
      .eq('clerk_id', userId);

    if (updateError) {
      console.error('Error updating user in Supabase:', updateError);
      return res.status(500).json({ error: 'Failed to update user record' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
