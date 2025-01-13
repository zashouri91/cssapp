import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";

// Mock data for initial development
const mockSurveys = [
  {
    id: 1,
    name: "Customer Service Feedback",
    status: "Active",
    responses: 124,
    lastModified: "2024-12-28",
  },
  {
    id: 2,
    name: "Product Satisfaction",
    status: "Draft",
    responses: 0,
    lastModified: "2024-12-29",
  },
  {
    id: 3,
    name: "Support Experience",
    status: "Active",
    responses: 89,
    lastModified: "2024-12-30",
  },
];

export default function Surveys() {
  const [surveys] = useState(mockSurveys);

  return (
    <DashboardLayout>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Surveys</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage feedback surveys for your email signatures.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/surveys/create"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              New Survey
            </span>
          </Link>
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
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Responses
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Modified
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {surveys.map((survey) => (
                    <tr key={survey.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {survey.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            survey.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {survey.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{survey.responses}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{survey.lastModified}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/surveys/${survey.id}`} className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
