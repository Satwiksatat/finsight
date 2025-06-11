'use client';

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/common/SideBar";
import { ChatProvider } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

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

          {/* Scrollable chat area */}
          <main className="flex-grow overflow-y-auto px-4 py-2">
            {children /* chat messages */}
          </main>

          {/* Fixed bottom input */}
          <footer className="border-t p-4">
            {/* Your ChatInput component or JSX */}
          </footer>
        </div>
      </div>
    </ChatProvider>
  );
}
