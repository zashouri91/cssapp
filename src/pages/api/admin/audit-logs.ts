import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { AuditLogger } from '@/lib/audit/auditLogger';
import { PermissionManager } from '@/lib/rbac/permissions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user has permission to view audit logs
  const permissionManager = PermissionManager.getInstance();
  const hasPermission = await permissionManager.hasPermission(
    { roles: ['admin'] }, // Only admins can view audit logs
    'manage:users'
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      userId: targetUserId,
      action,
      startDate,
      endDate,
      resource,
      limit,
      offset,
    } = req.query;

    const auditLogger = AuditLogger.getInstance();

    let logs;
    if (resource) {
      logs = await auditLogger.getAuditLogsByResource(
        String(resource),
        startDate ? new Date(String(startDate)) : undefined,
        endDate ? new Date(String(endDate)) : undefined
      );
    } else {
      logs = await auditLogger.getAuditLogs({
        userId: targetUserId ? String(targetUserId) : undefined,
        action: action ? String(action) : undefined,
        startDate: startDate ? new Date(String(startDate)) : undefined,
        endDate: endDate ? new Date(String(endDate)) : undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
    }

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
