'use client';

import { useEffect, useState } from 'react';
import { TrendSparkline } from '@/components/charts/TrendSparkline';

interface TrendsPayload {
  liquidityCurve: { labels: string[]; data: number[] };
  expenseRunRate: { labels: string[]; sgna: number[]; rd: number[] };
  anomalyWatchlist: { id: string; title: string; owner: string; eta: string; status: string }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<TrendsPayload | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/dashboard/trends', { cache: 'no-store' });
      if (response.ok) {
        setData(await response.json());
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Liquidity telemetry</p>
            <h2 className="text-2xl font-black text-[#212F34] dark:text-white">Runway & cash velocity</h2>
          </div>
          <span className="text-xs text-[#688790]">Auto synced every hour</span>
        </div>
        {data && <TrendSparkline data={data.liquidityCurve.data} color="#53AAA3" label="Cash & equivalents" suffix="M" />}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white/80 dark:bg-[#111A1B] border border-white/40 p-6 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790] mb-3">Expense run rate</p>
          {data ? (
            <ul className="space-y-2 text-sm text-[#212F34] dark:text-white">
              {data.expenseRunRate.labels.map((label, index) => (
                <li key={label} className="flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#0F191B] px-3 py-2">
                  <span>{label}</span>
                  <span className="font-semibold">SG&A {data.expenseRunRate.sgna[index]} · R&D {data.expenseRunRate.rd[index]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#688790]">Loading expense data…</p>
          )}
        </div>
        <div className="rounded-3xl bg-white/80 dark:bg-[#111A1B] border border-white/40 p-6 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790] mb-3">Anomaly watchlist</p>
          <div className="space-y-3">
            {data && data.anomalyWatchlist.length > 0 ? (
              data.anomalyWatchlist.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/60 dark:border-white/10 px-4 py-3 bg-white/60 dark:bg-[#0F191B]">
                  <p className="text-sm font-semibold text-[#212F34] dark:text-white">{item.title}</p>
                  <p className="text-xs text-[#688790]">Owner: {item.owner} • ETA {item.eta}</p>
                  <span className="text-[10px] uppercase tracking-widest text-[#53AAA3]">{item.status}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#688790]">No anomalies detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
