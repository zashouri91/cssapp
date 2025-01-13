import { OrganizationList, useUser } from "@clerk/nextjs";

export default function OrganizationPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Organization Management</h1>
      <div className="w-full max-w-2xl">
        <OrganizationList 
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>
    </div>
  );
}
