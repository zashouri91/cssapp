import { useEffect, useState } from 'react';
import { Permission } from '@/lib/rbac/types';
import { PermissionManager } from '@/lib/rbac/permissions';
import { useUser, useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Set<Permission>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user || !userLoaded || !orgLoaded) {
        setPermissions(new Set());
        setIsLoading(false);
        return;
      }

      try {
        const permissionManager = PermissionManager.getInstance();
        const userPermissions = await permissionManager.getUserPermissions(
          user.id,
          organization?.id || 'personal'
        );
        setPermissions(userPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    // Subscribe to role changes
    const roleSubscription = supabase
      .channel('role-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user?.id}${organization ? ` and organization_id=eq.${organization.id}` : ''}`,
        },
        () => {
          // Refresh permissions when roles change
          fetchPermissions();
        }
      )
      .subscribe();

    // Subscribe to permission changes
    const permissionSubscription = supabase
      .channel('permission-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_permissions',
          filter: `user_id=eq.${user?.id}${organization ? ` and organization_id=eq.${organization.id}` : ''}`,
        },
        () => {
          // Refresh permissions when custom permissions change
          fetchPermissions();
        }
      )
      .subscribe();

    return () => {
      roleSubscription.unsubscribe();
      permissionSubscription.unsubscribe();
    };
  }, [user, userLoaded, organization, orgLoaded]);

  return {
    isLoaded: userLoaded && orgLoaded && !isLoading,
    hasPermission: (permission: Permission) => permissions.has(permission),
    hasAnyPermission: (requiredPermissions: Permission[]) =>
      requiredPermissions.some(permission => permissions.has(permission)),
    hasAllPermissions: (requiredPermissions: Permission[]) =>
      requiredPermissions.every(permission => permissions.has(permission)),
    permissions,
  };
}
