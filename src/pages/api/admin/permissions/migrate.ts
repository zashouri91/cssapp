import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { PermissionMigrator } from '@/lib/rbac/migrations/permission-migrator';
import { PermissionManager } from '@/lib/rbac/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has permission to manage permissions
  const permissionManager = PermissionManager.getInstance();
  const hasPermission = await permissionManager.hasPermission(
    { roles: ['admin'] },
    'manage:users'
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action } = req.body;
    const migrator = PermissionMigrator.getInstance();

    switch (action) {
      case 'migrate':
        await migrator.migrateRoles(userId);
        await migrator.migrateUserPermissions(userId);
        break;

      case 'validate':
        const validation = await migrator.validatePermissions();
        return res.json(validation);

      case 'rollback':
        const { timestamp } = req.body;
        if (!timestamp) {
          return res.status(400).json({ error: 'Timestamp required for rollback' });
        }
        await migrator.rollback(new Date(timestamp));
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in permission migration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
