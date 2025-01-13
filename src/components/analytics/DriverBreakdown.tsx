import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DriverBreakdownProps {
  data: {
    driver: string;
    count: number;
    category: string;
  }[];
}

export function DriverBreakdown({ data }: DriverBreakdownProps) {
  const chartData = {
    labels: data.map(d => d.driver),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',  // blue
          'rgba(16, 185, 129, 0.5)',  // emerald
          'rgba(139, 92, 246, 0.5)',  // violet
          'rgba(245, 158, 11, 0.5)',  // amber
          'rgba(236, 72, 153, 0.5)',  // pink
          'rgba(6, 182, 212, 0.5)',   // cyan
          'rgba(168, 85, 247, 0.5)',  // purple
          'rgba(234, 179, 8, 0.5)',   // yellow
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)',
          'rgb(236, 72, 153)',
          'rgb(6, 182, 212)',
          'rgb(168, 85, 247)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Response Driver Distribution',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value * 100) / total).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col">
        <Doughnut data={chartData} options={options} />
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Categories</h4>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {Array.from(new Set(data.map(d => d.category))).map(category => (
              <div
                key={category}
                className="flex items-center text-sm"
              >
                <span className="w-3 h-3 rounded-full mr-2" style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.5)',
                }} />
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
