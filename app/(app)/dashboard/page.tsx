'use client';

import { useEffect, useState } from 'react';
import { PerformanceSnapshot } from '@/components/dashboard/PerformanceSnapshot';
import { KPICard } from '@/components/dashboard/KPICard';
import { WorkingCapitalChart } from '@/components/dashboard/WorkingCapitalChart';
import { RevenueMetrics } from '@/components/dashboard/RevenueMetrics';
import { FinancialHealthScore } from '@/components/dashboard/FinancialHealthScore';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { DashboardKpiPayload } from '@/lib/types';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardKpiPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard/kpis', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Unable to load dashboard data');
        }
        const payload = await response.json();
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-[#688790]">
        <div>
          <div className="agilitas-loader w-12 h-12 mx-auto mb-4" />
          <p className="text-sm uppercase tracking-[0.3em]">Synchronizing telemetry…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10">
        <div className="rounded-3xl border border-rose-300 bg-rose-50 p-6 text-rose-700">
          <p className="font-semibold mb-2">Dashboard unavailable</p>
          <p className="text-sm">{error || 'Failed to load data from the backend.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {data.cards.map((card) => (
          <KPICard key={card.id} title={card.title} value={card.value} delta={card.delta} trend={card.trend} suffix={card.suffix} subLabel={card.subLabel} />
        ))}
      </div>

      <PerformanceSnapshot title="CFO performance snapshot" kpis={data.snapshot} />

      <div className="grid gap-6 lg:grid-cols-2">
        <WorkingCapitalChart {...data.workingCapital} />
        <QuickActions />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueMetrics {...data.revenue} />
        <FinancialHealthScore {...data.health} />
      </div>
    </div>
  );
}
