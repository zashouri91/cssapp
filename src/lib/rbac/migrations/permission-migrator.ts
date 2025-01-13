import prisma from '@/lib/prisma';
import { Role, Permission } from '../types';
import { roles } from '../roles';
import { AuditLogger } from '@/lib/audit/auditLogger';

export class PermissionMigrator {
  private static instance: PermissionMigrator;
  private auditLogger: AuditLogger;

  private constructor() {
    this.auditLogger = AuditLogger.getInstance();
  }

  static getInstance(): PermissionMigrator {
    if (!PermissionMigrator.instance) {
      PermissionMigrator.instance = new PermissionMigrator();
    }
    return PermissionMigrator.instance;
  }

  async migrateRoles(adminUserId: string): Promise<void> {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    };

    for (const [roleName, roleDefinition] of Object.entries(roles)) {
      try {
        // Check if role exists in database
        const existingRole = await prisma.userRole.findFirst({
          where: { name: roleName },
        });

        if (!existingRole) {
          // Create new role
          await prisma.userRole.create({
            data: {
              name: roleName,
              userId: adminUserId, // Associate with admin user
            },
          });
          results.created++;

          await this.auditLogger.log(adminUserId, 'add_role', {
            role: roleName as Role,
            additionalInfo: { action: 'migration', type: 'create' },
          });
        }
      } catch (error) {
        console.error(`Error migrating role ${roleName}:`, error);
        results.errors.push(`Failed to migrate role ${roleName}`);
      }
    }

    console.log('Role migration results:', results);
  }

  async migrateUserPermissions(adminUserId: string): Promise<void> {
    const results = {
      updated: 0,
      errors: [] as string[],
    };

    try {
      // Get all users
      const users = await prisma.user.findMany({
        include: {
          roles: true,
          customPermissions: true,
        },
      });

      for (const user of users) {
        try {
          // Get expected permissions based on roles
          const expectedPermissions = new Set<Permission>();
          for (const role of user.roles) {
            const roleDefinition = roles[role.name as Role];
            if (roleDefinition) {
              roleDefinition.permissions.forEach((p) => expectedPermissions.add(p));
            }
          }

          // Get current permissions
          const currentPermissions = new Set(
            user.customPermissions.map((p) => p.permission as Permission)
          );

          // Calculate permissions to add and remove
          const toAdd = [...expectedPermissions].filter(
            (p) => !currentPermissions.has(p)
          );
          const toRemove = [...currentPermissions].filter(
            (p) => !expectedPermissions.has(p)
          );

          // Update permissions
          if (toAdd.length > 0 || toRemove.length > 0) {
            await prisma.$transaction(async (prisma) => {
              // Remove old permissions
              if (toRemove.length > 0) {
                await prisma.userPermission.deleteMany({
                  where: {
                    userId: user.id,
                    permission: {
                      in: toRemove,
                    },
                  },
                });
              }

              // Add new permissions
              if (toAdd.length > 0) {
                await prisma.userPermission.createMany({
                  data: toAdd.map((permission) => ({
                    userId: user.id,
                    permission,
                  })),
                });
              }
            });

            results.updated++;

            // Log the changes
            await this.auditLogger.log(adminUserId, 'add_permission', {
              targetUserId: user.id,
              additionalInfo: {
                action: 'migration',
                added: toAdd,
                removed: toRemove,
              },
            });
          }
        } catch (error) {
          console.error(`Error migrating permissions for user ${user.id}:`, error);
          results.errors.push(`Failed to migrate permissions for user ${user.id}`);
        }
      }
    } catch (error) {
      console.error('Error in permission migration:', error);
      results.errors.push('Failed to fetch users');
    }

    console.log('Permission migration results:', results);
  }

  async validatePermissions(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const users = await prisma.user.findMany({
        include: {
          roles: true,
          customPermissions: true,
        },
      });

      for (const user of users) {
        // Validate roles
        for (const role of user.roles) {
          if (!roles[role.name as Role]) {
            issues.push(`Invalid role '${role.name}' assigned to user ${user.id}`);
          }
        }

        // Validate permissions
        const validPermissions = new Set<Permission>();
        for (const role of user.roles) {
          const roleDefinition = roles[role.name as Role];
          if (roleDefinition) {
            roleDefinition.permissions.forEach((p) => validPermissions.add(p));
          }
        }

        for (const permission of user.customPermissions) {
          if (!validPermissions.has(permission.permission as Permission)) {
            issues.push(
              `Invalid permission '${permission.permission}' assigned to user ${user.id}`
            );
          }
        }
      }
    } catch (error) {
      console.error('Error validating permissions:', error);
      issues.push('Failed to validate permissions due to database error');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  async rollback(timestamp: Date): Promise<void> {
    try {
      // Get audit logs up to the timestamp
      const logs = await prisma.auditLog.findMany({
        where: {
          timestamp: {
            gte: timestamp,
          },
          action: {
            in: ['add_role', 'remove_role', 'add_permission', 'remove_permission'],
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      // Reverse the changes
      for (const log of logs) {
        const { action, details } = log;
        const reverseAction = this.getReverseAction(action);

        if (reverseAction) {
          await this.applyReverseAction(reverseAction, details);
        }
      }
    } catch (error) {
      console.error('Error rolling back permissions:', error);
      throw new Error('Failed to rollback permissions');
    }
  }

  private getReverseAction(action: string): string | null {
    const actionMap: Record<string, string> = {
      add_role: 'remove_role',
      remove_role: 'add_role',
      add_permission: 'remove_permission',
      remove_permission: 'add_permission',
    };

    return actionMap[action] || null;
  }

  private async applyReverseAction(
    action: string,
    details: any
  ): Promise<void> {
    const { targetUserId, role, permission } = details;

    switch (action) {
      case 'add_role':
        await prisma.userRole.create({
          data: {
            userId: targetUserId,
            name: role,
          },
        });
        break;

      case 'remove_role':
        await prisma.userRole.deleteMany({
          where: {
            userId: targetUserId,
            name: role,
          },
        });
        break;

      case 'add_permission':
        await prisma.userPermission.create({
          data: {
            userId: targetUserId,
            permission,
          },
        });
        break;

      case 'remove_permission':
        await prisma.userPermission.deleteMany({
          where: {
            userId: targetUserId,
            permission,
          },
        });
        break;
    }
  }
}
