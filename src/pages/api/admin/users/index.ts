import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '../../../../lib/supabase';
import { UserRole } from '../../../../types/user';

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing CLERK_SECRET_KEY');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('API Request received');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API Request headers:', req.headers);
    
    // Get the authenticated user from Clerk
    const auth = getAuth(req);
    const { userId: requesterId, orgId } = auth;
    
    console.log('Auth details:', { 
      requesterId, 
      orgId,
      hasUserId: !!requesterId,
      hasOrgId: !!orgId,
      sessionClaims: auth.sessionClaims,
      session: auth.session
    });

    if (!requesterId || !orgId) {
      const error = {
        message: !requesterId ? 'User not authenticated' : 'Organization not found',
        auth: {
          requesterId,
          orgId,
          hasSession: !!auth.session,
          hasToken: !!req.headers.authorization
        }
      };
      console.error('Authentication error:', error);
      return res.status(401).json({ error });
    }

    // Create Supabase client with session token
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Creating Supabase client with token:', token ? 'present' : 'missing');
    const supabase = createSupabaseClient(token);

    // Test Supabase connection
    console.log('Testing Supabase connection...');
    const testQuery = await supabase.from('users').select('count').limit(1);
    console.log('Test query result:', {
      success: !testQuery.error,
      error: testQuery.error?.message,
      data: testQuery.data
    });

    // Check if requester exists in our database
    console.log('Checking requester in database...');
    const { data: requester, error: requesterError } = await supabase
      .from('users')
      .select('role, organization_id, email')
      .eq('clerk_id', requesterId)
      .single();

    console.log('Requester query result:', { 
      success: !!requester, 
      error: requesterError?.message,
      data: requester,
      query: `SELECT role, organization_id, email FROM users WHERE clerk_id = '${requesterId}'`
    });

    if (requesterError) {
      // If no rows found, try to get user details from Clerk and create the user
      if (requesterError.code === 'PGRST116') {
        console.log('User not found, creating new user...');
        try {
          // Get user details from Clerk
          const clerkResponse = await fetch(
            `https://api.clerk.dev/v1/users/${requesterId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (!clerkResponse.ok) {
            throw new Error(`Clerk API error: ${clerkResponse.statusText}`);
          }

          const clerkUser = await clerkResponse.json();
          console.log('Got Clerk user details:', {
            id: clerkUser.id,
            email: clerkUser.email_addresses?.[0]?.email_address,
            firstName: clerkUser.first_name,
            lastName: clerkUser.last_name
          });

          // Insert the user with default role
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              clerk_id: requesterId,
              organization_id: orgId,
              role: 'admin', // First user in org is admin
              email: clerkUser.email_addresses[0]?.email_address || 'unknown@example.com',
              first_name: clerkUser.first_name || '',
              last_name: clerkUser.last_name || ''
            }])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user:', insertError);
            return res.status(500).json({ 
              error: 'Failed to create user record',
              details: insertError.message,
              code: insertError.code
            });
          }

          console.log('Created new user:', newUser);
          return res.status(200).json([]); // Return empty array for new users
        } catch (clerkError) {
          console.error('Error fetching Clerk user details:', clerkError);
          return res.status(500).json({ 
            error: 'Failed to fetch user details from Clerk',
            details: clerkError instanceof Error ? clerkError.message : 'Unknown error'
          });
        }
      }

      console.error('Error fetching requester:', requesterError);
      return res.status(500).json({ 
        error: 'Failed to fetch user details',
        details: requesterError.message,
        code: requesterError.code
      });
    }

    if (!requester) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requester.role !== 'admin' && requester.role !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get all users in the organization
    console.log('Fetching organization users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, clerk_id')
      .eq('organization_id', orgId);

    console.log('Users query result:', {
      success: !usersError,
      error: usersError?.message,
      count: users?.length,
      query: `SELECT id, email, first_name, last_name, role, clerk_id FROM users WHERE organization_id = '${orgId}'`
    });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ 
        error: 'Failed to fetch users',
        details: usersError.message,
        code: usersError.code
      });
    }

    // Transform the data to match our frontend expectations
    const transformedUsers = (users || []).map(user => ({
      id: user.clerk_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    }));

    console.log('Returning users:', transformedUsers.length);
    return res.status(200).json(transformedUsers);
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      type: 'UnexpectedError',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
