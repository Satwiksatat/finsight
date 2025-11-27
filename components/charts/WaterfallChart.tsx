interface WaterfallStep {
  label: string;
  value: number;
  type: 'increase' | 'decrease' | 'total';
}

interface WaterfallChartProps {
  steps: WaterfallStep[];
}

export function WaterfallChart({ steps }: WaterfallChartProps) {
  let cumulative = 0;
  const max = Math.max(...steps.map((step) => {
    if (step.type === 'total') {
      return Math.abs(step.value);
    }
    cumulative += step.type === 'increase' ? step.value : -step.value;
    return Math.abs(cumulative);
  })) || 1;

  cumulative = 0;

  return (
    <div className="flex items-end justify-between gap-4 h-48">
      {steps.map((step) => {
        let heightPercentage: number;
        if (step.type === 'total') {
          heightPercentage = (Math.abs(step.value) / max) * 100;
          cumulative = step.value;
        } else {
          cumulative += step.type === 'increase' ? step.value : -step.value;
          heightPercentage = (Math.abs(cumulative) / max) * 100;
        }

        const color =
          step.type === 'increase'
            ? 'linear-gradient(180deg, #53AAA3, #2A6F69)'
            : step.type === 'decrease'
            ? 'linear-gradient(180deg, #F87171, #B91C1C)'
            : 'linear-gradient(180deg, #A3CADA, #688790)';

        return (
          <div key={step.label} className="flex flex-col items-center text-center flex-1">
            <div className="text-xs text-[#688790] mb-2 flex flex-col">
              <span>{step.label}</span>
              <strong className="text-[#DEEDF2] text-sm">{step.value > 0 ? '+' : ''}{step.value.toLocaleString()}</strong>
            </div>
            <div className="w-8 rounded-full bg-white/10" style={{ height: `${heightPercentage}%` }}>
              <div className="w-full h-full rounded-full" style={{ background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
