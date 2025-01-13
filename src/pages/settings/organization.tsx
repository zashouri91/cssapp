import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useOrganization } from '@clerk/nextjs';

export default function OrganizationPage() {
  const { organization } = useOrganization();

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Organization Settings</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and manage your organization settings.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        disabled
                        value={organization?.name || ''}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Organization ID
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        disabled
                        value={organization?.id || ''}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <a
                    href="https://dashboard.clerk.dev/organizations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Manage Organization in Clerk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
