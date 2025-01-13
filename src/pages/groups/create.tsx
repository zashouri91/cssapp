import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization, useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export default function CreateGroupPage() {
  const router = useRouter();
  const { organization } = useOrganization();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Log user info when component mounts
  useEffect(() => {
    if (user?.id && organization?.id) {
      console.log('Current user:', {
        userId: user.id,
        organizationId: organization.id
      });
    }
  }, [user?.id, organization?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organization?.id) {
      setError('No organization selected');
      return;
    }

    if (!user?.id) {
      setError('No user found');
      return;
    }

    try {
      setLoading(true);

      console.log('Checking roles with:', {
        userId: user.id,
        organizationId: organization.id
      });

      // First check if user has admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('organization_id', organization.id)
        .eq('role', 'admin');

      console.log('Found roles:', roles);
      
      if (rolesError) {
        console.error('Error checking roles:', rolesError);
        throw rolesError;
      }

      if (!roles?.length) {
        throw new Error('You must be an admin to create groups');
      }

      console.log('Creating group with data:', {
        name: formData.name,
        description: formData.description,
        organization_id: organization.id,
        created_by: user.id
      });

      const { error: createError } = await supabase
        .from('groups')
        .insert({
          name: formData.name,
          description: formData.description,
          organization_id: organization.id,
          created_by: user.id
        });

      if (createError) {
        console.error('Detailed error:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        throw createError;
      }

      router.push('/groups');
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Group</h1>
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
