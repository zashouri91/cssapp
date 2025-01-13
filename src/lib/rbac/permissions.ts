import { Role, Permission } from './types';
import { roles } from './roles';
import { supabase } from '../supabase';

export class PermissionManager {
  private static instance: PermissionManager;
  private permissionCache: Map<string, Set<Permission>> = new Map();

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  private getCacheKey(userId: string, organizationId: string): string {
    return `${userId}:${organizationId}`;
  }

  async getUserPermissions(userId: string, organizationId: string): Promise<Set<Permission>> {
    const cacheKey = this.getCacheKey(userId, organizationId);
    
    // Check cache first
    const cached = this.permissionCache.get(cacheKey);
    if (cached) return cached;

    // Get permissions from Supabase
    const { data: permissions, error } = await supabase
      .rpc('get_user_permissions', { 
        p_user_id: userId,
        p_organization_id: organizationId 
      });

    if (error) {
      console.error('Error fetching permissions:', error);
      return new Set();
    }

    // Convert to Set
    const permissionSet = new Set<Permission>(
      permissions.map(p => p.permission as Permission)
    );

    // Cache the result
    this.permissionCache.set(cacheKey, permissionSet);

    return permissionSet;
  }

  async getUserRoles(userId: string, organizationId: string): Promise<Role[]> {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return roles.map(r => r.role);
  }

  async addRole(
    adminUserId: string,
    targetUserId: string,
    organizationId: string,
    role: Role
  ): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: targetUserId,
        organization_id: organizationId,
        role
      });

    if (error) {
      console.error('Error adding role:', error);
      throw error;
    }

    // Clear cache
    this.permissionCache.delete(this.getCacheKey(targetUserId, organizationId));

    // Log action
    await this.logAuditEvent(adminUserId, organizationId, 'add_role', {
      targetUserId,
      role,
    });
  }

  async removeRole(
    adminUserId: string,
    targetUserId: string,
    organizationId: string,
    role: Role
  ): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', targetUserId)
      .eq('organization_id', organizationId)
      .eq('role', role);

    if (error) {
      console.error('Error removing role:', error);
      throw error;
    }

    // Clear cache
    this.permissionCache.delete(this.getCacheKey(targetUserId, organizationId));

    // Log action
    await this.logAuditEvent(adminUserId, organizationId, 'remove_role', {
      targetUserId,
      role,
    });
  }

  async addCustomPermission(
    adminUserId: string,
    targetUserId: string,
    organizationId: string,
    permission: Permission
  ): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .insert({
        user_id: targetUserId,
        organization_id: organizationId,
        permission
      });

    if (error) {
      console.error('Error adding permission:', error);
      throw error;
    }

    // Clear cache
    this.permissionCache.delete(this.getCacheKey(targetUserId, organizationId));

    // Log action
    await this.logAuditEvent(adminUserId, organizationId, 'add_permission', {
      targetUserId,
      permission,
    });
  }

  async removeCustomPermission(
    adminUserId: string,
    targetUserId: string,
    organizationId: string,
    permission: Permission
  ): Promise<void> {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', targetUserId)
      .eq('organization_id', organizationId)
      .eq('permission', permission);

    if (error) {
      console.error('Error removing permission:', error);
      throw error;
    }

    // Clear cache
    this.permissionCache.delete(this.getCacheKey(targetUserId, organizationId));

    // Log action
    await this.logAuditEvent(adminUserId, organizationId, 'remove_permission', {
      targetUserId,
      permission,
    });
  }

  private async logAuditEvent(
    userId: string,
    organizationId: string,
    action: 'add_role' | 'remove_role' | 'add_permission' | 'remove_permission',
    details: any
  ): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        action,
        details,
      });

    if (error) {
      console.error('Error logging audit event:', error);
    }
  }

  clearCache(): void {
    this.permissionCache.clear();
  }
}
