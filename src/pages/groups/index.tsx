import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
  member_count: { count: number } | number | null;
}

export default function GroupsPage() {
  const { organization } = useOrganization();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;
    loadGroups();
  }, [organization?.id]);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          created_at,
          member_count: group_members(count)
        `)
        .eq('organization_id', organization?.id)
        .order('name');

      if (error) throw error;

      // Transform the data to handle the nested count object
      const transformedGroups = data?.map(group => {
        let count = 0;
        if (typeof group.member_count === 'number') {
          count = group.member_count;
        } else if (group.member_count && typeof group.member_count === 'object') {
          count = (group.member_count as { count: number }).count || 0;
        }

        return {
          ...group,
          member_count: count
        };
      }) || [];

      setGroups(transformedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
            <Link
              href="/groups/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Group
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {group.name}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>{group.description}</p>
                      </div>
                      <div className="mt-4">
                        <span className="text-sm text-gray-500">
                          {group.member_count} members
                        </span>
                        <span className="mx-2">•</span>
                        <span className="text-sm text-gray-500">
                          Created {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <Link
                        href={`/groups/${group.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
