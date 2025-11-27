import { TrendSparkline } from '@/components/charts/TrendSparkline';

interface KPICardProps {
  title: string;
  value: string;
  delta: number;
  trend: number[];
  suffix?: string;
  subLabel?: string;
}

export function KPICard({ title, value, delta, trend, suffix = '%', subLabel }: KPICardProps) {
  const direction = delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down';
  const color = direction === 'up' ? '#53AAA3' : direction === 'down' ? '#F87171' : '#A3CADA';

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#111A1B] to-[#1A2B31] border border-white/5 p-4 shadow-lg flex flex-col gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#688790]">{title}</p>
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-3xl font-black text-white">{value}</span>
          <span className="text-sm font-semibold" style={{ color }}>
            {direction === 'up' && '▲'}
            {direction === 'down' && '▼'} {Math.abs(delta).toFixed(1)}{suffix}
          </span>
        </div>
        {subLabel && <p className="text-xs text-[#A3CADA]">{subLabel}</p>}
      </div>
      <TrendSparkline data={trend} color={color} />
    </div>
  );
}
