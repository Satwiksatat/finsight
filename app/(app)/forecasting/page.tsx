'use client';

import { useState } from 'react';

const levers = [
  { id: 'demand', label: 'Demand uplift', suffix: '%', defaultValue: 4 },
  { id: 'pricing', label: 'Pricing actions', suffix: '%', defaultValue: 2 },
  { id: 'fx', label: 'FX impact', suffix: 'bps', defaultValue: -35 },
];

export default function ForecastingPage() {
  const [inputs, setInputs] = useState(() =>
    Object.fromEntries(levers.map((lever) => [lever.id, lever.defaultValue]))
  );

  const handleChange = (id: string, value: number) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const projectedRoi = 17.5 + (inputs.demand ?? 0) * 0.2 + (inputs.pricing ?? 0) * 0.3 + (inputs.fx ?? 0) / 100;

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Scenario lab</p>
        <h1 className="text-3xl font-black text-[#212F34] dark:text-white">Forecast & ROI simulation</h1>
        <p className="text-sm text-[#688790] mt-2">Adjust demand, pricing, and FX assumptions to see ROIC shifts.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-sm dark:bg-[#111A1B] dark:border-white/10">
          {levers.map((lever) => (
            <div key={lever.id} className="mb-6">
              <div className="flex items-center justify-between text-sm font-semibold text-[#212F34] dark:text-white">
                <span>{lever.label}</span>
                <span>{inputs[lever.id]}{lever.suffix}</span>
              </div>
              <input
                type="range"
                min={lever.suffix === 'bps' ? -100 : -5}
                max={lever.suffix === 'bps' ? 100 : 10}
                step={lever.suffix === 'bps' ? 5 : 0.5}
                value={inputs[lever.id]}
                onChange={(event) => handleChange(lever.id, Number(event.target.value))}
                className="w-full mt-2"
              />
            </div>
          ))}
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#212F34] to-[#111A1B] text-white p-6 border border-white/10 shadow">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9FC6D5]">Projected ROIC</p>
          <h2 className="text-5xl font-black">{projectedRoi.toFixed(1)}%</h2>
          <p className="text-sm text-[#A3CADA] mt-2">Includes hedging gains and distribution efficiency.</p>
          <button className="mt-6 rounded-2xl bg-[#53AAA3] px-4 py-2 text-xs uppercase tracking-[0.3em] font-black">Export scenario</button>
        </div>
      </div>
    </div>
  );
}
