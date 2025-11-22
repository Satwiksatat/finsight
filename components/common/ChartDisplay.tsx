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
  
  // Professional Agilitas colors
  const agilitasColors = {
    primary: '#3B82F6',
    secondary: '#374151',
    accent: '#0891B2',
    primaryLight: '#60A5FA',
    primaryDark: '#1E40AF',
    accentLight: '#22D3EE',
    accentDark: '#0E7490',
  };
  
  // Apply Agilitas colors to datasets
  const brandedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || [
        agilitasColors.primary,
        agilitasColors.accent,
        agilitasColors.secondary,
        agilitasColors.primaryLight,
        agilitasColors.accentDark,
      ][index % 5],
      borderColor: dataset.borderColor || [
        agilitasColors.primaryDark,
        agilitasColors.accentDark,
        agilitasColors.secondary,
        agilitasColors.primary,
        agilitasColors.accent,
      ][index % 5],
      borderWidth: dataset.borderWidth || 2,
    })),
  };
  
  // Enhanced options with Agilitas styling
  const brandedOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...options?.plugins,
      legend: {
        ...options?.plugins?.legend,
        labels: {
          ...options?.plugins?.legend?.labels,
          font: {
            family: 'Montserrat, sans-serif',
            weight: '600',
            size: 12,
          },
          color: '#1A1A1A',
        },
      },
      title: {
        ...options?.plugins?.title,
        font: {
          family: 'Oswald, sans-serif',
          weight: '700',
          size: 16,
        },
        color: '#1A1A1A',
      },
    },
    scales: chartType === 'bar' || chartType === 'line' ? {
      ...options?.scales,
      x: {
        ...options?.scales?.x,
        ticks: {
          ...options?.scales?.x?.ticks,
          font: {
            family: 'Montserrat, sans-serif',
            weight: '500',
          },
          color: '#666666',
        },
        grid: {
          ...options?.scales?.x?.grid,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y: {
        ...options?.scales?.y,
        ticks: {
          ...options?.scales?.y?.ticks,
          font: {
            family: 'Montserrat, sans-serif',
            weight: '500',
          },
          color: '#666666',
        },
        grid: {
          ...options?.scales?.y?.grid,
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    } : undefined,
  };

  const chartComponent = () => {
    switch (chartType) {
      case 'bar':
        return <Bar data={brandedData} options={brandedOptions} />;
      case 'line':
        return <Line data={brandedData} options={brandedOptions} />;
      case 'pie':
        return <Pie data={brandedData} options={brandedOptions} />;
      case 'doughnut':
        return <Doughnut data={brandedData} options={brandedOptions} />;
      default:
        return <div className="text-red-500">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div className="w-full h-auto card-agilitas p-6 my-4">
      {/* Performance header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {title && (
            <h4 className="text-2xl font-bold uppercase tracking-wider mb-2 text-gradient">
              {title}
            </h4>
          )}
          {chartData.description && (
            <p className="text-sm text-muted-foreground italic">
              {chartData.description}
            </p>
          )}
        </div>
        <div className="w-32 h-2 bg-secondary/20 rounded-full overflow-hidden">
          <div className="performance-meter" />
        </div>
      </div>
      
      {/* Chart container with athletic styling */}
      <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-br from-background to-muted/20 rounded-lg p-4 border-2 border-primary/10">
        {chartComponent()}
      </div>
      
      {/* Performance metrics footer */}
      <div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-primary">
          {chartType} Analysis
        </span>
        <span className="text-accent">
          {data.datasets.length} Dataset{data.datasets.length !== 1 ? 's' : ''}
        </span>
        <span className="text-secondary">
          {data.labels.length} Data Points
        </span>
      </div>
    </div>
  );
}