import { StackedAreaChart } from '@/components/charts/StackedAreaChart';
import { RevenueBreakdown } from '@/lib/types';

type RevenueMetricsProps = RevenueBreakdown;

export function RevenueMetrics({ labels, channels, summary }: RevenueMetricsProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0C1618] to-[#1D2C31] border border-white/5 p-6 shadow-xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Revenue mix</p>
          <h3 className="text-xl font-black text-white">Channel contribution</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#A3CADA]">
          {summary.map((item) => (
            <div key={item.label} className="flex flex-col text-right">
              <span className="uppercase tracking-widest text-[10px] text-[#688790]">{item.label}</span>
              <strong className="text-sm text-white">{item.value}</strong>
              <span className={item.delta >= 0 ? 'text-[#53AAA3]' : 'text-rose-400'}>
                {item.delta >= 0 ? '+' : ''}
                {item.delta}% vs plan
              </span>
            </div>
          ))}
        </div>
      </div>
      <StackedAreaChart labels={labels} datasets={channels} />
    </div>
  );
}
