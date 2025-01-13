import React, { useState } from 'react';
import { PermissionGate } from '../auth/PermissionGate';

interface ValidationIssue {
  valid: boolean;
  issues: string[];
}

export function PermissionMigration() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [validation, setValidation] = useState<ValidationIssue | null>(null);
  const [rollbackDate, setRollbackDate] = useState<string>('');

  const handleMigrate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate' }),
      });

      const data = await response.json();
      setResult(
        data.success
          ? 'Migration completed successfully'
          : `Migration failed: ${data.error}`
      );
    } catch (error) {
      setResult('Migration failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate' }),
      });

      const data = await response.json();
      setValidation(data);
    } catch (error) {
      setResult('Validation failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackDate) {
      setResult('Please select a rollback date');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rollback',
          timestamp: new Date(rollbackDate).toISOString(),
        }),
      });

      const data = await response.json();
      setResult(
        data.success
          ? 'Rollback completed successfully'
          : `Rollback failed: ${data.error}`
      );
    } catch (error) {
      setResult('Rollback failed: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGate permissions={['manage:users']}>
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-bold">Permission Migration Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Migration */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Migrate Permissions</h3>
            <p className="text-sm text-gray-500 mb-4">
              Update all user permissions based on their roles.
            </p>
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Migrating...' : 'Start Migration'}
            </button>
          </div>

          {/* Validation */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Validate Permissions</h3>
            <p className="text-sm text-gray-500 mb-4">
              Check for any permission inconsistencies.
            </p>
            <button
              onClick={handleValidate}
              disabled={loading}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {loading ? 'Validating...' : 'Validate'}
            </button>
          </div>

          {/* Rollback */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Rollback Changes</h3>
            <p className="text-sm text-gray-500 mb-4">
              Revert permissions to a previous state.
            </p>
            <input
              type="datetime-local"
              value={rollbackDate}
              onChange={(e) => setRollbackDate(e.target.value)}
              className="w-full mb-4 rounded-md border-gray-300 shadow-sm"
            />
            <button
              onClick={handleRollback}
              disabled={loading || !rollbackDate}
              className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {loading ? 'Rolling back...' : 'Rollback'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div
            className={`mt-4 p-4 rounded-md ${
              result.includes('failed')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {result}
          </div>
        )}

        {/* Validation Results */}
        {validation && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Validation Results</h3>
            <div
              className={`p-4 rounded-md ${
                validation.valid
                  ? 'bg-green-50 text-green-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              <p className="font-medium">
                Status: {validation.valid ? 'Valid' : 'Issues Found'}
              </p>
              {validation.issues.length > 0 && (
                <ul className="mt-2 list-disc list-inside">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
