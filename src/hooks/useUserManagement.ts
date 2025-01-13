import { useUser, useOrganization } from '@clerk/nextjs';
import { useState, useCallback } from 'react';
import { UserRole, type User } from '../types/user';

export const useUserManagement = () => {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserRole = useCallback(async (userId: string, role: UserRole) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteUser = useCallback(async (email: string, role: UserRole) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          role,
          organizationId: organization?.id 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to invite user');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  const removeUserFromOrg = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove user');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentUser: user,
    organization,
    loading,
    error,
    updateUserRole,
    inviteUser,
    removeUserFromOrg,
  };
};
