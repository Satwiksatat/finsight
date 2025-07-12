'use client';

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/common/SideBar";
import { ChatProvider } from "@/context/ChatContext";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <ChatProvider>
      <div className="flex flex-row w-full min-h-screen">
        <Sidebar />
        
        <div className="flex flex-col flex-1">
          {/* Top-right theme toggle */}
          <div className="absolute top-4 right-4 z-10">
            <button
              className="bg-muted text-muted-foreground p-2 rounded"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
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
