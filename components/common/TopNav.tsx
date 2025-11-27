'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LineChart, MessageSquare, PieChart, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { NotificationCenter } from '@/components/common/NotificationCenter';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', href: '/analytics', icon: PieChart },
  { label: 'Forecasting', href: '/forecasting', icon: LineChart },
  { label: 'Reports', href: '/reports', icon: Sparkles },
  { label: 'Copilot Chat', href: '/chat', icon: MessageSquare },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-white/10 bg-white/50 dark:bg-[#0B1416]/70 backdrop-blur-md">
      <div className="flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all',
                isActive
                  ? 'bg-[#212F34] text-white shadow-lg'
                  : 'bg-white/70 text-[#212F34] hover:bg-white border border-white/50',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <NotificationCenter />
      </div>
    </div>
  );
}
