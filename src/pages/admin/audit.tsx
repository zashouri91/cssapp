import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

export default function AuditLogsPage() {
  const { organization } = useOrganization();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization?.id) return;

    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('organization_id', organization.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [organization?.id]);

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Showing the last 50 actions in your organization.
                </p>
              </div>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.user_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <pre className="text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
