'use client';

import { Line } from 'react-chartjs-2';
import { ensureChartJsRegistered } from '@/lib/registerCharts';
import { WorkingCapitalData } from '@/lib/types';

ensureChartJsRegistered();

type WorkingCapitalChartProps = WorkingCapitalData;

export function WorkingCapitalChart({ cycleDays, targetDays, history }: WorkingCapitalChartProps) {
  const data = {
    labels: history.map((entry) => entry.label),
    datasets: [
      {
        label: 'Cash Conversion Cycle',
        data: history.map((entry) => entry.value),
        borderColor: '#53AAA3',
        backgroundColor: 'rgba(83,170,163,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Target',
        data: history.map(() => targetDays),
        borderColor: '#F87171',
        borderDash: [6, 6],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#688790' } },
      y: {
        grid: { color: 'rgba(255,255,255,0.08)' },
        ticks: {
          color: '#688790',
          callback: (value: number) => `${value}d`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  const progress = Math.min((targetDays / cycleDays) * 100, 100);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0F191B] to-[#1a2b31] p-6 border border-white/5 shadow-lg h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Working capital</p>
          <h3 className="text-2xl font-black text-[#DEEDF2]">{cycleDays} Days</h3>
          <p className="text-xs text-[#A3CADA]">Target: {targetDays} days</p>
        </div>
        <div className="w-24">
          <div className="text-xs text-right text-[#688790] mb-1">Target proximity</div>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-[#53AAA3]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <div className="h-48">
        <Line
          data={data}
          options={{
            ...options,
            scales: {
              ...options.scales,
              y: {
                ...options.scales.y,
                ticks: {
                  ...options.scales.y.ticks,
                  // Chart.js v3+ expects the y-axis tick callback with these args:
                  callback: function (tickValue: string | number) {
                    return `${tickValue}d`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
