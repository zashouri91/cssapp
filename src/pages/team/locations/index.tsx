import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Mock data for initial development
const mockLocations = [
  {
    id: 1,
    name: "New York Office",
    address: "123 Broadway, New York, NY 10013",
    memberCount: 45,
    timezone: "America/New_York",
    createdAt: "2024-12-28",
  },
  {
    id: 2,
    name: "San Francisco HQ",
    address: "456 Market Street, San Francisco, CA 94105",
    memberCount: 120,
    timezone: "America/Los_Angeles",
    createdAt: "2024-12-29",
  },
  {
    id: 3,
    name: "London Office",
    address: "789 Oxford Street, London, UK",
    memberCount: 30,
    timezone: "Europe/London",
    createdAt: "2024-12-30",
  },
];

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: typeof mockLocations[0];
  onSave: (location: { name: string; address: string; timezone: string }) => void;
}

function LocationModal({ isOpen, onClose, location, onSave }: LocationModalProps) {
  const [name, setName] = useState(location?.name || "");
  const [address, setAddress] = useState(location?.address || "");
  const [timezone, setTimezone] = useState(location?.timezone || "UTC");

  if (!isOpen) return null;

  // Common timezones for the dropdown
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Singapore",
    "Australia/Sydney",
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {location ? "Edit Location" : "Add New Location"}
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({ name, address, timezone });
              onClose();
            }}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Locations() {
  const [locations, setLocations] = useState(mockLocations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<typeof mockLocations[0] | undefined>();

  const handleSave = (locationData: { name: string; address: string; timezone: string }) => {
    if (editingLocation) {
      // Edit existing location
      setLocations(locations.map(location => 
        location.id === editingLocation.id 
          ? { ...location, ...locationData }
          : location
      ));
    } else {
      // Create new location
      setLocations([
        ...locations,
        {
          id: Math.max(...locations.map(l => l.id)) + 1,
          ...locationData,
          memberCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setEditingLocation(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(locations.filter(location => location.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Locations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage office locations and assign team members to specific sites.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setEditingLocation(undefined);
              setIsModalOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <span className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Location
            </span>
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Members
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Timezone
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {location.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {location.address}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {location.memberCount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {location.timezone.replace('_', ' ')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setEditingLocation(location);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLocation(undefined);
        }}
        location={editingLocation}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
