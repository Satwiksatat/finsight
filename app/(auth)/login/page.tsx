import { Suspense } from 'react';
import { LoginClient } from './LoginClient';

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DEEDF2] dark:bg-[#05090A]">
      <div className="text-center text-[#688790]">
        <div className="agilitas-loader w-12 h-12 mx-auto mb-4" />
        <p className="text-xs uppercase tracking-[0.3em]">Loading console…</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
