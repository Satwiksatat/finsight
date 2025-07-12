'use client';

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/common/SideBar";
import { ChatProvider } from "@/context/ChatContext";
import { HeaderDropdown } from "@/components/common/HeaderDropdown";

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
    <ChatProvider>
      <div className="flex flex-row w-full min-h-screen">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          {/* Top-right dropdown menu */}
          <div className="absolute top-4 right-4 z-50 mr-2 mt-2">
            <HeaderDropdown
              onClearStorage={handleClearStorage}
              onToggleTheme={() => setIsDark(!isDark)}
              isDarkMode={isDark}
            />
          </div>

          {/* Main content area */}
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
