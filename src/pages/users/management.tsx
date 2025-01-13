import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserRole } from '@/types/user';
import { useOrganization, useUser, useAuth } from '@clerk/nextjs';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const { organization } = useOrganization();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { inviteUser, updateUserRole, removeUserFromOrg } = useUserManagement();

  useEffect(() => {
    if (organization?.id && user?.id) {
      fetchUsers();
    }
  }, [organization?.id, user?.id]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users with token...');
      const token = await getToken();
      console.log('Got token:', token ? 'present' : 'missing');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        console.error('API error:', {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (!Array.isArray(data)) {
        console.error('Expected array of users, got:', data);
        throw new Error('Invalid response format');
      }

      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await inviteUser(inviteEmail, selectedRole);
      setInviteEmail('');
      await fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      setError(error instanceof Error ? error.message : 'Failed to invite user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setError(null);
      await updateUserRole(userId, newRole);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      try {
        setError(null);
        await removeUserFromOrg(userId);
        await fetchUsers();
      } catch (error) {
        console.error('Error removing user:', error);
        setError(error instanceof Error ? error.message : 'Failed to remove user');
      }
    }
  };

  if (!organization || !user) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center text-muted-foreground">
            {!organization ? 'Please select an organization to manage users.' : 'Loading user information...'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">User Management</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {/* Invite User Form */}
        <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-medium mb-4">Invite New User</h2>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full p-2 border rounded-md"
              >
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Send Invitation
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as UserRole)
                          }
                          className="text-sm p-1 border rounded"
                        >
                          {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
