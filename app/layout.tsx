// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/common/SideBar";
import { ChatProvider } from "@/context/ChatContext";

// Configure Inter font with the 'variable' option for Tailwind CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Defines the CSS variable name for this font
});

export const metadata: Metadata = {
  title: "Agentic Chatbot UI",
  description: "A professional frontend for an agentic chat flow chatbot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased flex", // Essential layout and theme classes
          inter.variable // Links the Inter font's CSS variable to the body
        )}
      >
        <ChatProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col"> {/* Main content area takes remaining space, organizes children vertically */}
            {children}
          </main>
        </ChatProvider>
      </body>
    </html>
  );
}