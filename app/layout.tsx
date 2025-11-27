// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { inter } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'FinSight CFO Co-Pilot',
  description: 'Executive-grade dashboards, chat, and insights for CFO teams.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background text-foreground font-sans antialiased flex flex-col',
          inter.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
