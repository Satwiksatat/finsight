'use client';

import { Line } from 'react-chartjs-2';
import type { TooltipItem, ChartOptions } from 'chart.js';
import { ensureChartJsRegistered } from '@/lib/registerCharts';

ensureChartJsRegistered();

interface StackedAreaChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export function StackedAreaChart({ labels, datasets }: StackedAreaChartProps) {
  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      fill: true,
      borderColor: dataset.color,
      backgroundColor: `${dataset.color}33`,
      tension: 0.4,
      pointRadius: 0,
    })),
  };

  const options: ChartOptions<'line'> = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111A1B',
        borderColor: '#53AAA3',
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'line'>) =>
            `${context.dataset.label}: ${context.parsed.y?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            })}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#688790' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#688790',
          callback: (value: number | string) => {
            const numericValue = typeof value === 'number' ? value : Number(value);
            if (Number.isNaN(numericValue)) {
              return value.toString();
            }
            return `$${numericValue / 1000}K`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="h-56">
      <Line data={data} options={options} />
    </div>
  );
}
