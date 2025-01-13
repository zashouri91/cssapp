import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Role, Permission } from '@/lib/rbac/types';
import { roles } from '@/lib/rbac/roles';
import { PermissionGate } from '../auth/PermissionGate';

interface User {
  id: string;
  name: string;
  email: string;
  roles: { name: Role }[];
  customPermissions: { permission: Permission }[];
}

export function RoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, role: Role, checked: boolean) => {
    try {
      const response = await fetch('/api/admin/users/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, action: checked ? 'add' : 'remove' }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handlePermissionChange = async (
    userId: string,
    permission: Permission,
    checked: boolean
  ) => {
    try {
      const response = await fetch('/api/admin/users/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          permission,
          action: checked ? 'add' : 'remove',
        }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user permission:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <PermissionGate permissions={['manage:users']}>
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Role Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User List */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedUser === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-sm text-gray-400">
                    Roles: {user.roles.map((r) => r.name).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role and Permission Management */}
          {selectedUser && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Manage Roles & Permissions</h3>
              
              {/* Roles */}
              <div className="mb-6">
                <h4 className="font-medium mb-2">Roles</h4>
                <div className="space-y-2">
                  {Object.values(roles).map((role) => {
                    const user = users.find((u) => u.id === selectedUser);
                    const hasRole = user?.roles.some((r) => r.name === role.name);

                    return (
                      <label key={role.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hasRole}
                          onChange={(e) =>
                            handleRoleChange(selectedUser, role.name, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <span>{role.name}</span>
                        <span className="text-sm text-gray-500">
                          - {role.description}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Permissions */}
              <div>
                <h4 className="font-medium mb-2">Custom Permissions</h4>
                <div className="space-y-2">
                  {Object.values(roles).flatMap((role) =>
                    role.permissions.map((permission) => {
                      const user = users.find((u) => u.id === selectedUser);
                      const hasPermission = user?.customPermissions.some(
                        (p) => p.permission === permission
                      );

                      return (
                        <label
                          key={permission}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={hasPermission}
                            onChange={(e) =>
                              handlePermissionChange(
                                selectedUser,
                                permission,
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          <span>{permission}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}
