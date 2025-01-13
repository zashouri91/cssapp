import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useOrganization } from "@clerk/nextjs";

export default function Dashboard() {
  const { organization, isLoaded } = useOrganization();
  
  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          Dashboard
        </h1>
        {!isLoaded ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : organization ? (
          <div className="space-y-2">
            <p className="text-gray-700">Organization: <span className="font-medium">{organization.name}</span></p>
            <p className="text-gray-700">Organization ID: <span className="font-mono text-sm">{organization.id}</span></p>
          </div>
        ) : (
          <div className="text-gray-600 bg-gray-50 rounded-md p-4">
            <p>No organization selected</p>
            <p className="text-sm mt-2">Create or select an organization to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
