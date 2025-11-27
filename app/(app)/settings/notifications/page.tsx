'use client';

import { useState } from 'react';

const channels = [
  { id: 'email', label: 'Email', description: 'Daily digest + escalation alerts' },
  { id: 'slack', label: 'Slack', description: 'Real-time anomaly pings' },
  { id: 'sms', label: 'SMS', description: 'Critical cash or credit events' },
];

export default function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ email: true, slack: true, sms: false });

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-3xl bg-white/80 dark:bg-[#0B1416] border border-white/40 p-6 shadow">
        <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Settings · Notifications</p>
        <h1 className="text-2xl font-black text-[#212F34] dark:text-white">Alert routing rules</h1>
      </div>
      <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-sm dark:bg-[#111A1B] dark:border-white/10 space-y-4">
        {channels.map((channel) => (
          <div key={channel.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#212F34] dark:text-white">{channel.label}</p>
              <p className="text-xs text-[#688790]">{channel.description}</p>
            </div>
            <button
              onClick={() => setEnabled((prev) => ({ ...prev, [channel.id]: !prev[channel.id] }))}
              className={`w-12 h-6 rounded-full ${enabled[channel.id] ? 'bg-[#53AAA3]' : 'bg-gray-300'} relative transition-all`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${enabled[channel.id] ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
