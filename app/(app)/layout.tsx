import ClientRootLayout from '../ClientRootLayout';

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientRootLayout>{children}</ClientRootLayout>;
}
