import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TrendLineProps {
  data: {
    date: string;
    value: number;
    type: string;
  }[];
  title: string;
  timeUnit?: 'day' | 'week' | 'month';
}

export function TrendLine({ data, title, timeUnit = 'day' }: TrendLineProps) {
  // Group data by type
  const types = [...new Set(data.map(d => d.type))];
  const datasets = types.map((type, index) => {
    const typeData = data.filter(d => d.type === type);
    return {
      label: type,
      data: typeData.map(d => ({ x: new Date(d.date), y: d.value })),
      borderColor: [
        '#3B82F6',  // blue
        '#10B981',  // emerald
        '#8B5CF6',  // violet
        '#F59E0B',  // amber
      ][index % 4],
      backgroundColor: [
        'rgba(59, 130, 246, 0.5)',
        'rgba(16, 185, 129, 0.5)',
        'rgba(139, 92, 246, 0.5)',
        'rgba(245, 158, 11, 0.5)',
      ][index % 4],
      tension: 0.3,
    };
  });

  const chartData = {
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleDateString();
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeUnit,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
}
