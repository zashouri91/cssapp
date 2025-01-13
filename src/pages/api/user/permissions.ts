import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Role, Permission } from '@/lib/rbac/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch user's roles and custom permissions from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        roles: true,
        customPermissions: true,
      },
    });

    if (!user) {
      // If user doesn't exist in our database yet, create them with default role
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          roles: {
            create: {
              name: 'user' as Role,
            },
          },
        },
        include: {
          roles: true,
          customPermissions: true,
        },
      });

      return res.json({
        roles: newUser.roles.map(r => r.name),
        customPermissions: [],
      });
    }

    // Return user's permissions
    return res.json({
      roles: user.roles.map(r => r.name),
      customPermissions: user.customPermissions.map(p => p.permission),
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
