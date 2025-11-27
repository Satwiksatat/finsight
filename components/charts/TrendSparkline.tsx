interface TrendSparklineProps {
  data: number[];
  color?: string;
  label?: string;
  suffix?: string;
}

export function TrendSparkline({ data, color = '#53AAA3', label, suffix = '%' }: TrendSparklineProps) {
  if (data.length === 0) {
    return null;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const normalize = (value: number) => ((value - min) / (max - min || 1)) * 50;
  const points = data
    .map((value, index) => `${(index / (data.length - 1 || 1)) * 100},${50 - normalize(value)}`)
    .join(' ');

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-xs uppercase tracking-widest text-[#688790]">{label}</span>}
      <div className="h-16 rounded-2xl bg-[#0F1A1C] border border-white/5 p-2">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={100} cy={50 - normalize(data[data.length - 1])} r="2.5" fill={color} />
        </svg>
        <div className="text-xs text-[#DEEDF2] font-semibold mt-1">
          {data[data.length - 1].toFixed(1)} {suffix}
        </div>
      </div>
    </div>
  );
}
