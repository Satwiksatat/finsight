import { CircularGauge } from '@/components/charts/CircularGauge';
import { DashboardSnapshotKPI } from '@/lib/types';

interface PerformanceSnapshotProps {
  title: string;
  kpis: DashboardSnapshotKPI[];
}

export function PerformanceSnapshot({ title, kpis }: PerformanceSnapshotProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0B1416] to-[#1C2C32] border border-white/5 shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">CFO snapshot</p>
          <h2 className="text-2xl font-black">{title}</h2>
        </div>
        <div className="text-xs text-[#A3CADA]">Live telemetry • Updated 3m ago</div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <CircularGauge key={kpi.id} label={kpi.label} value={kpi.value} target={kpi.target} delta={kpi.delta} color={kpi.color} suffix={kpi.suffix} footnote={kpi.footnote} />
        ))}
      </div>
    </div>
  );
}
