import '../globals.css';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DEEDF2] dark:bg-[#111A1B]">
      {children}
    </div>
  );
}
