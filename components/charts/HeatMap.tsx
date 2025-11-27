interface HeatMapCell {
  label: string;
  value: number;
  status?: 'positive' | 'negative' | 'neutral';
}

interface HeatMapRow {
  title: string;
  cells: HeatMapCell[];
}

interface HeatMapProps {
  rows: HeatMapRow[];
}

function getCellColor(cell: HeatMapCell) {
  if (cell.status === 'positive') return 'rgba(83,170,163,0.8)';
  if (cell.status === 'negative') return 'rgba(244,63,94,0.7)';
  return 'rgba(104,135,144,0.6)';
}

export function HeatMap({ rows }: HeatMapProps) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.title} className="grid grid-cols-4 gap-2">
          <div className="text-xs uppercase tracking-widest text-[#688790] flex items-center">
            {row.title}
          </div>
          {row.cells.map((cell) => (
            <div key={cell.label} className="flex flex-col p-2 rounded-xl bg-[#0F1A1C] border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-[#688790]">{cell.label}</span>
              <strong className="text-[#DEEDF2] text-sm">{cell.value.toFixed(1)}%</strong>
              <div className="mt-1 h-1.5 rounded-full" style={{ background: getCellColor(cell) }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
