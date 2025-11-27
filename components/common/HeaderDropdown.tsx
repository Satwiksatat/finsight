// components/common/HeaderDropdown.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  Moon,
  ShieldAlert,
  Sparkles,
  Sun,
  Trash2,
  UserCog,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

interface HeaderDropdownProps {
  onClearStorage: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export function HeaderDropdown({ onClearStorage, onToggleTheme, isDarkMode }: HeaderDropdownProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((segment) => segment[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FC';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/80 dark:bg-[#111A1B] border border-white/40 shadow-lg hover:border-[#53AAA3] transition-all">
          <Avatar className="h-8 w-8 border border-[#A3CADA]/50">
            <AvatarFallback className="bg-[#A3CADA]/40 text-[#111A1B] font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-[#212F34] dark:text-white">{user?.name ?? 'FinSight CFO'}</span>
            <span className="text-[10px] uppercase tracking-widest text-[#688790]">{user?.title ?? 'Command Console'}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-[#688790]" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-xl border border-[#A3CADA]/30 shadow-2xl" align="end">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.3em] text-[#688790]">
          Control Center
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-3 text-[#212F34]"
          onClick={() => router.push('/settings')}
        >
          <UserCog className="w-4 h-4 text-[#53AAA3]" /> Preferences & Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-3 text-[#212F34]"
          onClick={() => router.push('/settings/notifications')}
        >
          <ShieldAlert className="w-4 h-4 text-[#A3CADA]" /> Alert & Notification Rules
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 text-[#212F34]" onClick={onToggleTheme}>
          {isDarkMode ? <Sun className="w-4 h-4 text-[#53AAA3]" /> : <Moon className="w-4 h-4 text-[#53AAA3]" />}
          {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-3 text-[#212F34]" onClick={onClearStorage}>
          <Trash2 className="w-4 h-4 text-rose-500" /> Clear local storage
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-3 text-[#212F34]" onClick={() => router.push('/reports')}>
          <Sparkles className="w-4 h-4 text-[#53AAA3]" /> Executive Reports
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-3 text-rose-600" onClick={logout}>
          <LogOut className="w-4 h-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}