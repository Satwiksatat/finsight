import clsx from 'clsx';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface CircularGaugeProps {
  label: string;
  value: number;
  suffix?: string;
  target?: number;
  delta?: number;
  color?: string;
  footnote?: string;
}

export function CircularGauge({
  label,
  value,
  suffix = '%',
  target,
  delta,
  color = '#53AAA3',
  footnote,
}: CircularGaugeProps) {
  const safeValue = Math.max(value, 0);
  const maxValue = target ?? 100;
  const clampedValue = Math.min(safeValue, maxValue);
  const progressRatio = clampedValue / maxValue;
  const exceedsTarget = target ? value > target : false;
  const direction = delta && delta !== 0 ? (delta > 0 ? 'up' : 'down') : 'flat';

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-[#111A1B] via-[#1B2A2F] to-[#111A1B] border border-white/5 shadow-lg text-[#DEEDF2]">
      <div className="text-xs uppercase tracking-[0.35em] text-[#688790] mb-4">{label}</div>
      <div className="flex items-center gap-6">
        <div className="relative h-28 w-28">
          <CircularProgressbarWithChildren
            value={clampedValue}
            maxValue={maxValue}
            strokeWidth={10}
            styles={buildStyles({
              strokeLinecap: 'round',
              trailColor: 'rgba(255,255,255,0.08)',
              pathColor: color,
            })}
          >
            <div className="flex flex-col items-center justify-center text-center px-2">
              <span className="text-2xl font-black text-white leading-tight">
                {value.toFixed(1)}
                {suffix}
              </span>
              {delta !== undefined && (
                <span
                  className={clsx(
                    'text-[11px] font-semibold',
                    direction === 'up' ? 'text-[#53AAA3]' : direction === 'down' ? 'text-rose-400' : 'text-[#688790]',
                  )}
                >
                  {direction === 'up' && '▲'}
                  {direction === 'down' && '▼'}
                  {direction === 'flat' && '•'} {Math.abs(delta).toFixed(1)}bps
                </span>
              )}
              {target !== undefined && (
                <span className="text-[10px] text-[#688790]">
                  Target {target}
                  {suffix}
                </span>
              )}
            </div>
          </CircularProgressbarWithChildren>
          {exceedsTarget && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#53AAA3]/15 px-3 py-1 text-[10px] uppercase tracking-widest text-[#53AAA3] border border-[#53AAA3]/40">
              Above target
          </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-[#B8CBD6]">
            {footnote || 'Performance updated with the latest quarter close and anomaly detection checks.'}
          </p>
          {target !== undefined && (
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${progressRatio * 100}%`,
                  background: color,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

