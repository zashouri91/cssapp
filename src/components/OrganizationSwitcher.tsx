import { OrganizationSwitcher } from "@clerk/nextjs";

export function OrganizationSwitcherComponent() {
  return (
    <OrganizationSwitcher 
      appearance={{
        elements: {
          rootBox: "flex justify-center",
          organizationSwitcherTrigger: "bg-white shadow-sm rounded-lg p-2"
        }
      }}
    />
  );
}
