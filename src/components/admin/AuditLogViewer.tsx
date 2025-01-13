import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PermissionGate } from '../auth/PermissionGate';

interface AuditLog {
  id: string;
  action: string;
  details: any;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

interface FilterOptions {
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  resource?: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = async (newPage = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
        limit: '50',
        offset: String((newPage - 1) * 50),
      });

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`);
      const data = await response.json();

      if (newPage === 1) {
        setLogs(data);
      } else {
        setLogs((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 50);
      setPage(newPage);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (name: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
    setPage(1);
  };

  const formatDetails = (details: any): string => {
    try {
      const formatted = Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      return formatted;
    } catch (error) {
      return 'Invalid details format';
    }
  };

  return (
    <PermissionGate permissions={['manage:users']}>
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Audit Logs</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">All Actions</option>
              <option value="add_role">Add Role</option>
              <option value="remove_role">Remove Role</option>
              <option value="add_permission">Add Permission</option>
              <option value="remove_permission">Remove Permission</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="access_denied">Access Denied</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Resource
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Enter resource name"
              onChange={(e) => handleFilterChange('resource', e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
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
                    {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.user.name}
                    </div>
                    <div className="text-sm text-gray-500">{log.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDetails(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={loading}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
