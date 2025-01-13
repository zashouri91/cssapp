import React from 'react';
import { Permission } from '@/lib/rbac/types';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permissions?: Permission[];
  requireAll?: boolean;
}

export function PermissionGate({
  children,
  fallback = null,
  permissions = [],
  requireAll = true,
}: PermissionGateProps) {
  const { isLoaded, hasAllPermissions, hasAnyPermission } = usePermissions();

  if (!isLoaded) {
    return null;
  }

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
