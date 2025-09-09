// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { inter } from "@/lib/fonts"; 
import ClientRootLayout from "./ClientRootLayout"; 

export const metadata: Metadata = {
  title: "Agentic Chatbot UI",
  description: "A professional frontend for an agentic chat flow chatbot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
    "min-h-screen bg-background text-foreground font-sans antialiased flex flex-col",
    inter.variable 
        )}
      >
        <ClientRootLayout>{children}</ClientRootLayout>
      </body>
    </html>
  );
}
