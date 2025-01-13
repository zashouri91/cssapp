import { useState, useEffect } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

type Role = 'admin' | 'manager' | 'employee' | 'user';

interface UserRole {
  id: string;
  email: string;
  full_name: string | null;
  roles: Role[];
}

export default function UserRoleManager() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization?.id) return;
    loadUsers();
  }, [organization?.id]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all profiles in the organization
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('organization_id', organization?.id);

      if (profilesError) throw profilesError;

      // Get all roles for these profiles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('organization_id', organization?.id);

      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      const usersWithRoles = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        roles: roles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as Role)
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: Role, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            organization_id: organization?.id,
            role
          });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .match({
            user_id: userId,
            organization_id: organization?.id,
            role
          });
        
        if (error) throw error;
      }

      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          organization_id: organization?.id,
          action: action === 'add' ? 'add_role' : 'remove_role',
          details: {
            target_user_id: userId,
            role
          }
        });

      // Reload users
      await loadUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage User Roles</h2>
      <div className="grid gap-4">
        {users.map(user => (
          <div key={user.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{user.full_name || user.email}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex gap-2">
                {(['admin', 'manager', 'employee', 'user'] as Role[]).map(role => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={user.roles.includes(role)}
                      onChange={(e) => {
                        updateUserRole(user.id, role, e.target.checked ? 'add' : 'remove');
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
