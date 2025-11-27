import { HeatMap } from '@/components/charts/HeatMap';
import { WaterfallChart } from '@/components/charts/WaterfallChart';
import { HealthScoreData } from '@/lib/types';

export function FinancialHealthScore({ score, commentary, heatmap, waterfall }: HealthScoreData) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#0A1416] to-[#17242A] border border-white/5 p-6 shadow-xl grid gap-6 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Health index</p>
        <div className="flex items-end gap-4">
          <h3 className="text-5xl font-black text-[#DEEDF2]">{score}</h3>
          <span className="text-sm text-[#A3CADA]">/ 100</span>
        </div>
        <p className="text-sm text-[#B8CBD6] mt-2">{commentary}</p>
        <div className="mt-6">
          <HeatMap rows={heatmap} />
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Cash + margin drivers</p>
        <WaterfallChart steps={waterfall} />
      </div>
    </div>
  );
}
