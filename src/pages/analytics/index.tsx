import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  MapPinIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { RatingDistribution } from '@/components/analytics/RatingDistribution';
import { TrendLine } from '@/components/analytics/TrendLine';
import { DriverBreakdown } from '@/components/analytics/DriverBreakdown';
import { LocationHeatmap } from '@/components/analytics/LocationHeatmap';
import { WordCloud } from '@/components/analytics/WordCloud';
import { ExportTools } from '@/components/analytics/ExportTools';
import { ComparativeAnalysis } from '@/components/analytics/ComparativeAnalysis';

// Mock data - replace with API calls
const mockData = {
  stats: {
    totalResponses: 1234,
    averageRating: 4.5,
    responseRate: '78%',
    lastMonth: {
      responses: 156,
      trend: '+12%',
    },
  },
  groups: ['Sales', 'Support', 'Engineering', 'Marketing'],
  locations: ['New York', 'San Francisco', 'London', 'Singapore'],
  surveys: ['Customer Support Feedback', 'Product Experience', 'General Satisfaction'],
  responses: [
    {
      id: 1,
      date: '2025-01-10',
      employee: 'John Doe',
      group: 'Support',
      location: 'New York',
      survey: 'Customer Support Feedback',
      rating: 5,
      drivers: ['Quick Response', 'Problem Resolution'],
      feedback: 'Excellent service, resolved my issue quickly.',
    },
    // Add more mock responses...
  ],
};

const mockAnalyticsData = {
  ratingDistribution: [
    { rating: 1, count: 50 },
    { rating: 2, count: 120 },
    { rating: 3, count: 250 },
    { rating: 4, count: 480 },
    { rating: 5, count: 600 },
  ],
  trends: [
    { date: '2025-01-01', value: 4.2, type: 'Average Rating' },
    { date: '2025-01-02', value: 4.3, type: 'Average Rating' },
    { date: '2025-01-03', value: 4.4, type: 'Average Rating' },
    { date: '2025-01-04', value: 4.5, type: 'Average Rating' },
    { date: '2025-01-01', value: 85, type: 'Response Rate' },
    { date: '2025-01-02', value: 87, type: 'Response Rate' },
    { date: '2025-01-03', value: 82, type: 'Response Rate' },
    { date: '2025-01-04', value: 89, type: 'Response Rate' },
  ],
  drivers: [
    { driver: 'Quick Response', count: 450, category: 'Speed' },
    { driver: 'Clear Communication', count: 380, category: 'Communication' },
    { driver: 'Problem Resolution', count: 320, category: 'Quality' },
    { driver: 'Friendly Service', count: 290, category: 'Attitude' },
  ],
  locations: [
    { name: 'New York', coordinates: [-74.006, 40.7128], value: 450 },
    { name: 'San Francisco', coordinates: [-122.4194, 37.7749], value: 280 },
    { name: 'London', coordinates: [-0.1276, 51.5074], value: 320 },
    { name: 'Singapore', coordinates: [103.8198, 1.3521], value: 180 },
  ],
  words: [
    { text: 'helpful', value: 100, sentiment: 'positive' },
    { text: 'quick', value: 80, sentiment: 'positive' },
    { text: 'professional', value: 75, sentiment: 'positive' },
    { text: 'slow', value: 40, sentiment: 'negative' },
    { text: 'confusing', value: 35, sentiment: 'negative' },
    { text: 'average', value: 50, sentiment: 'neutral' },
  ],
  comparative: {
    groups: [
      {
        name: 'Sales',
        metrics: {
          averageRating: 4.5,
          responseRate: 85,
          responseTime: 2.3,
          positiveResponsePercentage: 92,
        },
      },
      {
        name: 'Support',
        metrics: {
          averageRating: 4.2,
          responseRate: 78,
          responseTime: 1.8,
          positiveResponsePercentage: 88,
        },
      },
    ],
    locations: [
      {
        name: 'New York',
        metrics: {
          averageRating: 4.3,
          responseRate: 82,
          responseTime: 2.1,
          positiveResponsePercentage: 90,
        },
      },
      {
        name: 'San Francisco',
        metrics: {
          averageRating: 4.4,
          responseRate: 80,
          responseTime: 2.0,
          positiveResponsePercentage: 89,
        },
      },
    ],
  },
};

interface FilterState {
  dateRange: string;
  groups: string[];
  locations: string[];
  surveys: string[];
  employees: string[];
  minRating: number;
  maxRating: number;
}

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last30',
    groups: [],
    locations: [],
    surveys: [],
    employees: [],
    minRating: 1,
    maxRating: 5,
  });

  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      name: 'Total Responses',
      value: mockData.stats.totalResponses,
      trend: mockData.stats.lastMonth.trend,
      icon: ChartBarIcon,
    },
    {
      name: 'Average Rating',
      value: mockData.stats.averageRating,
      trend: '+0.3',
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Response Rate',
      value: mockData.stats.responseRate,
      trend: '+2.3%',
      icon: DocumentTextIcon,
    },
  ];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Feedback Analytics</h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Filters */}
          <div className="mt-4 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="last7">Last 7 days</option>
                  <option value="last30">Last 30 days</option>
                  <option value="last90">Last 90 days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Groups</label>
                <select
                  multiple
                  value={filters.groups}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      groups: Array.from(e.target.selectedOptions, (option) => option.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {mockData.groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Locations</label>
                <select
                  multiple
                  value={filters.locations}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      locations: Array.from(e.target.selectedOptions, (option) => option.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {mockData.locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Survey Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Surveys</label>
                <select
                  multiple
                  value={filters.surveys}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      surveys: Array.from(e.target.selectedOptions, (option) => option.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  {mockData.surveys.map((survey) => (
                    <option key={survey} value={survey}>
                      {survey}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
              >
                <dt>
                  <div className="absolute bg-indigo-500 rounded-md p-3">
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                </dt>
                <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend}
                  </p>
                </dd>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-4">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="overview">Overview</option>
                <option value="responses">Responses</option>
                <option value="trends">Trends</option>
                <option value="drivers">Response Drivers</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {['overview', 'responses', 'trends', 'drivers'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`${
                        activeTab === tab
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="mt-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <RatingDistribution data={mockAnalyticsData.ratingDistribution} />
                  <TrendLine
                    data={mockAnalyticsData.trends}
                    title="Rating & Response Rate Trends"
                    timeUnit="day"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <DriverBreakdown data={mockAnalyticsData.drivers} />
                  <LocationHeatmap data={mockAnalyticsData.locations} />
                </div>
                <WordCloud words={mockAnalyticsData.words} />
                <ComparativeAnalysis data={mockAnalyticsData.comparative} />
                <ExportTools
                  data={mockData.responses}
                  reportName="Feedback Analytics"
                  onScheduleReport={(schedule) => {
                    console.log('Schedule report:', schedule);
                    // Implement report scheduling logic
                  }}
                />
              </div>
            )}

            {activeTab === 'responses' && (
              <div className="space-y-4">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flow-root">
                      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                              <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                  Date
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Employee
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Rating
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Feedback
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                  Drivers
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {mockData.responses.map((response) => (
                                <tr key={response.id}>
                                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                                    {response.date}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {response.employee}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {response.rating}/5
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {response.feedback}
                                  </td>
                                  <td className="px-3 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1">
                                      {response.drivers.map((driver) => (
                                        <span
                                          key={driver}
                                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                        >
                                          {driver}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-4">
                <TrendLine
                  data={mockAnalyticsData.trends}
                  title="Rating & Response Rate Trends"
                  timeUnit="day"
                />
                <ComparativeAnalysis data={mockAnalyticsData.comparative} />
              </div>
            )}

            {activeTab === 'drivers' && (
              <div className="space-y-4">
                <DriverBreakdown data={mockAnalyticsData.drivers} />
                <WordCloud words={mockAnalyticsData.words} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
