import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '../../../../lib/supabase';
import { UserRole } from '../../../../types/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
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
      .select('role')
      .eq('clerk_id', requesterId)
      .single();

    if (requesterError || !requester || requester.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { userId, role } = req.body;

    if (!userId || !role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user role:', updateError);
      return res.status(500).json({ error: 'Failed to update user role' });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
