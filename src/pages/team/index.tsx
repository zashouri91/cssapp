import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlusIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Mock data for initial development
const mockMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    groups: ["Sales Team", "Management"],
    location: "New York Office",
    status: "Active",
    lastActive: "2024-12-28",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    groups: ["Customer Support"],
    location: "San Francisco HQ",
    status: "Active",
    lastActive: "2024-12-29",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "User",
    groups: ["Sales Team"],
    location: "London Office",
    status: "Pending",
    lastActive: "2024-12-30",
  },
];

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: typeof mockMembers[0];
  onSave: (member: {
    name: string;
    email: string;
    role: string;
    groups: string[];
    location: string;
  }) => void;
}

function MemberModal({ isOpen, onClose, member, onSave }: MemberModalProps) {
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [role, setRole] = useState(member?.role || "User");
  const [selectedGroups, setSelectedGroups] = useState<string[]>(member?.groups || []);
  const [location, setLocation] = useState(member?.location || "");

  if (!isOpen) return null;

  // Mock data for dropdowns
  const roles = ["Admin", "Manager", "User"];
  const groups = ["Sales Team", "Customer Support", "Management"];
  const locations = ["New York Office", "San Francisco HQ", "London Office"];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {member ? "Edit Team Member" : "Add Team Member"}
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="groups" className="block text-sm font-medium text-gray-700">
              Groups
            </label>
            <select
              id="groups"
              multiple
              value={selectedGroups}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                setSelectedGroups(values);
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {groups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple groups</p>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a location</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
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
              onSave({ name, email, role, groups: selectedGroups, location });
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

export default function TeamMembers() {
  const [members, setMembers] = useState(mockMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<typeof mockMembers[0] | undefined>();

  const handleSave = (memberData: {
    name: string;
    email: string;
    role: string;
    groups: string[];
    location: string;
  }) => {
    if (editingMember) {
      // Edit existing member
      setMembers(members.map(member => 
        member.id === editingMember.id 
          ? { ...member, ...memberData }
          : member
      ));
    } else {
      // Create new member
      setMembers([
        ...members,
        {
          id: Math.max(...members.map(m => m.id)) + 1,
          ...memberData,
          status: "Pending",
          lastActive: new Date().toISOString().split('T')[0],
        },
      ]);
    }
    setEditingMember(undefined);
  };

  return (
    <DashboardLayout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage team members, their roles, groups, and locations.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setEditingMember(undefined);
              setIsModalOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <span className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Member
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
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Groups
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Location
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-gray-500">{member.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.role}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.groups.join(", ")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {member.location}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            member.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setEditingMember(member);
                            setIsModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
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

      <MemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMember(undefined);
        }}
        member={editingMember}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}
