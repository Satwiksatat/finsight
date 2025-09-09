// components/common/ChartDisplay.tsx
'use client'; // Chart.js needs to be client-side

import React from 'react';
import { ChartData, ChartContent } from '@/lib/types';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDisplayProps {
  chartData: ChartContent;
}

export function ChartDisplay({ chartData }: ChartDisplayProps) {
  console.log('ChartDisplay received:', chartData);
  console.log('Chart data validation:', {
    hasChartData: !!chartData,
    hasData: !!chartData?.data,
    chartType: chartData?.chartType,
    dataLabels: chartData?.data?.labels,
    dataDatasets: chartData?.data?.datasets
  });
  
  if (!chartData || !chartData.data) {
    console.log('ChartDisplay: Invalid chart data, returning error');
    return <div className="text-red-500">Invalid chart data provided.</div>;
  }

  const { chartType, title, data, options } = chartData;

  const chartComponent = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <div className="text-red-500">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="w-full h-auto bg-background p-4 rounded-lg shadow-md my-4">
      {title && <h4 className="text-lg font-semibold text-center mb-4">{title}</h4>}
      {chartData.description && (
        <p className="text-sm text-muted-foreground mb-4 text-center italic">
          {chartData.description}
        </p>
      )}
      <div className="relative h-64 md:h-80 lg:h-96"> {/* Responsive height */}
        {chartComponent()}
      </div>
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Chart type: {chartType} • {data.datasets.length} dataset{data.datasets.length !== 1 ? 's' : ''} • {data.labels.length} data points
      </div>
    </div>
  );
}