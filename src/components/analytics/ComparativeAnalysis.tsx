import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparativeAnalysisProps {
  data: {
    groups: {
      name: string;
      metrics: {
        averageRating: number;
        responseRate: number;
        responseTime: number;
        positiveResponsePercentage: number;
      };
    }[];
    locations: {
      name: string;
      metrics: {
        averageRating: number;
        responseRate: number;
        responseTime: number;
        positiveResponsePercentage: number;
      };
    }[];
  };
}

export function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
  const [comparisonType, setComparisonType] = useState<'groups' | 'locations'>('groups');
  const [metric, setMetric] = useState<keyof typeof data.groups[0]['metrics']>('averageRating');

  const metrics = {
    averageRating: { label: 'Average Rating', max: 5 },
    responseRate: { label: 'Response Rate (%)', max: 100 },
    responseTime: { label: 'Response Time (hours)', max: 48 },
    positiveResponsePercentage: { label: 'Positive Responses (%)', max: 100 },
  };

  const chartData = {
    labels: data[comparisonType].map(item => item.name),
    datasets: [
      {
        label: metrics[metric].label,
        data: data[comparisonType].map(item => item.metrics[metric]),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${metrics[metric].label} by ${comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: metrics[metric].max,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <select
            value={comparisonType}
            onChange={(e) => setComparisonType(e.target.value as 'groups' | 'locations')}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="groups">Groups</option>
            <option value="locations">Locations</option>
          </select>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as keyof typeof data.groups[0]['metrics'])}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.entries(metrics).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <Bar data={chartData} options={options} />

      {/* Stats Table */}
      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {comparisonType === 'groups' ? 'Group' : 'Location'}
              </th>
              {Object.values(metrics).map(({ label }) => (
                <th
                  key={label}
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data[comparisonType].map((item) => (
              <tr key={item.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                {Object.keys(metrics).map((metricKey) => (
                  <td
                    key={metricKey}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {metricKey.includes('Percentage') || metricKey === 'responseRate'
                      ? `${item.metrics[metricKey as keyof typeof item.metrics].toFixed(1)}%`
                      : item.metrics[metricKey as keyof typeof item.metrics].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
