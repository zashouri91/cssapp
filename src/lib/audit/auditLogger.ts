import prisma from '@/lib/prisma';
import { Role, Permission } from '../rbac/types';

type AuditAction =
  | 'add_role'
  | 'remove_role'
  | 'add_permission'
  | 'remove_permission'
  | 'login'
  | 'logout'
  | 'access_denied';

interface AuditDetails {
  targetUserId?: string;
  role?: Role;
  permission?: Permission;
  resource?: string;
  ip?: string;
  userAgent?: string;
  additionalInfo?: Record<string, any>;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(
    userId: string,
    action: AuditAction,
    details: AuditDetails
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details: details as any, // Prisma handles JSON serialization
        },
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      // In production, you might want to use a more robust error handling strategy
      // such as sending to an error monitoring service
    }
  }

  async getAuditLogs(options: {
    userId?: string;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const {
      userId,
      action,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    return prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getAuditLogsByResource(
    resource: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: {
        details: {
          path: ['resource'],
          equals: resource,
        },
        ...(startDate || endDate
          ? {
              timestamp: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
