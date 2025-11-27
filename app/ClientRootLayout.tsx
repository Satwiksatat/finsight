'use client';

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/common/SideBar";
import { ChatProvider } from "@/context/ChatContext";
import { HeaderDropdown } from "@/components/common/HeaderDropdown";
import { AuthProvider } from "@/context/AuthContext";
import { TopNav } from "@/components/common/TopNav";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleClearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      alert('All storage data cleared. Please refresh the page.');
    }
  };

  return (
    <AuthProvider>
      <ChatProvider>
        <div className="flex flex-row w-full min-h-screen bg-[#DEEDF2] dark:bg-[#05090A]">
          <Sidebar />

          <div className="flex flex-col flex-1 relative">
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/20 bg-white/70 dark:bg-[#0B1416]/70 backdrop-blur-xl">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#688790]">FinSight Control Tower</p>
                <h1 className="text-2xl font-black text-[#111A1B] dark:text-white">CFO Co-Pilot</h1>
              </div>
              <HeaderDropdown
                onClearStorage={handleClearStorage}
                onToggleTheme={() => setIsDark(!isDark)}
                isDarkMode={isDark}
              />
            </header>
            <TopNav />

            <main className="flex-grow flex flex-col overflow-y-auto">{children}</main>
          </div>
        </div>
      </ChatProvider>
    </AuthProvider>
  );
}
