import React from 'react';
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

interface RatingDistributionProps {
  data: {
    rating: number;
    count: number;
  }[];
}

export function RatingDistribution({ data }: RatingDistributionProps) {
  const chartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Ratings',
        data: data.map(d => d.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.5)',   // red for 1 star
          'rgba(249, 115, 22, 0.5)',  // orange for 2 stars
          'rgba(234, 179, 8, 0.5)',   // yellow for 3 stars
          'rgba(34, 197, 94, 0.5)',   // green for 4 stars
          'rgba(16, 185, 129, 0.5)',  // emerald for 5 stars
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(249, 115, 22)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Rating Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
}
