import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Mock data for initial development
const mockGroups = [
  {
    id: 1,
    name: "Sales Team",
    description: "Sales and business development team members",
    memberCount: 12,
    createdAt: "2024-12-28",
  },
  {
    id: 2,
    name: "Customer Support",
    description: "Front-line customer support representatives",
    memberCount: 8,
    createdAt: "2024-12-29",
  },
  {
    id: 3,
    name: "Management",
    description: "Team leads and managers",
    memberCount: 4,
    createdAt: "2024-12-30",
  },
];

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: typeof mockGroups[0];
  onSave: (group: { name: string; description: string }) => void;
}

function GroupModal({ isOpen, onClose, group, onSave }: GroupModalProps) {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {group ? "Edit Group" : "Create New Group"}
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
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
              onSave({ name, description });
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

export default function Groups() {
  const [groups, setGroups] = useState(mockGroups);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<typeof mockGroups[0] | undefined>();

  const handleSave = (groupData: { name: string; description: string }) => {
    if (editingGroup) {
      // Edit existing group
      setGroups(groups.map(group => 
        group.id === editingGroup.id 
          ? { ...group, ...groupData }
          : group
      ));
    } else {
      // Create new group
      setGroups([
        ...groups,
        {
          id: Math.max(...groups.map(g => g.id)) + 1,
          ...groupData,
          memberCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setEditingGroup(undefined);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this group?')) {
      setGroups(groups.filter(group => group.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage team groups for organizing members and controlling access.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setEditingGroup(undefined);
              setIsModalOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <span className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Group
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
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Members
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Created
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {group.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {group.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {group.memberCount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {group.createdAt}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setEditingGroup(group);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id)}
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

      <GroupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGroup(undefined);
        }}
        group={editingGroup}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
