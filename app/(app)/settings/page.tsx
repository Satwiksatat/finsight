'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [timezone, setTimezone] = useState('America/New_York');
  const [autoSync, setAutoSync] = useState(true);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Settings</p>
        <h1 className="text-3xl font-black text-[#212F34] dark:text-white">Control tower preferences</h1>
        <p className="text-sm text-[#688790] mt-2">Manage workspace defaults, routing policies, and data retention.</p>
      </div>

      <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-sm dark:bg-[#111A1B] dark:border-white/10 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-[#688790]">Workspace timezone</label>
          <select
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm"
          >
            <option value="America/New_York">New York (ET)</option>
            <option value="America/Chicago">Chicago (CT)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#212F34] dark:text-white">Auto-sync documents</p>
            <p className="text-xs text-[#688790]">Push uploaded PDFs to the ingestion mesh automatically.</p>
          </div>
          <button
            onClick={() => setAutoSync((prev) => !prev)}
            className={`w-12 h-6 rounded-full ${autoSync ? 'bg-[#53AAA3]' : 'bg-gray-300'} relative transition-all`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${autoSync ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
