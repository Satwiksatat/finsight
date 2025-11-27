'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Loader2 } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard/alerts', { cache: 'no-store' });
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.warn('Failed to load alerts', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full bg-white/80 dark:bg-[#111A1B] border border-white/40 shadow-lg hover:border-[#53AAA3] transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-[#111A1B] dark:text-white" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white/95 dark:bg-[#0F1416] border border-white/20 shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#688790]">Alerts</span>
            <button className="text-[10px] uppercase tracking-widest text-[#53AAA3]" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-6 text-[#688790] text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Syncing telemetry
            </div>
          )}
          {!loading && alerts.length === 0 && <p className="text-xs text-[#688790]">No critical alerts. All systems nominal.</p>}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/70 dark:bg-[#111A1B] p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className="h-4 w-4"
                    color={alert.severity === 'critical' ? '#F87171' : alert.severity === 'warning' ? '#FACC15' : '#53AAA3'}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#111A1B] dark:text-white">{alert.title}</p>
                    <p className="text-[10px] uppercase tracking-widest text-[#688790]">{alert.timestamp}</p>
                  </div>
                </div>
                <p className="text-xs text-[#54636A] dark:text-[#B8CBD6] mt-2">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
