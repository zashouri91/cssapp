import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { useEffect } from "react";

export function OrganizationSwitcher() {
  const { organization } = useOrganization();
  const { userMemberships, isLoaded, setActive } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Debug logging
  useEffect(() => {
    if (isLoaded && userMemberships?.data) {
      console.log('Organization:', organization?.id);
      console.log('UserMemberships:', userMemberships.data.length);
      console.log('IsLoaded:', isLoaded);
    }
  }, [organization?.id, userMemberships?.data, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="px-6 py-2">
        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!userMemberships.data?.length) {
    return (
      <div className="px-6 py-2">
        <div className="text-sm text-gray-600">
          No organizations found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-2">
      <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
        Organization
      </label>
      <select
        id="organization"
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        value={organization?.id || ""}
        onChange={(e) => {
          const membership = userMemberships.data?.find(
            (m) => m.organization.id === e.target.value
          );
          if (membership) {
            try {
              setActive({ organization: membership.organization });
            } catch (error) {
              console.error('Error setting active organization:', error);
            }
          }
        }}
      >
        <option value="">Select an organization</option>
        {userMemberships.data?.map((membership) => (
          <option key={membership.organization.id} value={membership.organization.id}>
            {membership.organization.name || membership.organization.id}
          </option>
        ))}
      </select>
    </div>
  );
}
