'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { demoUsers } from '@/lib/auth';
import { LineChart, Sparkles } from 'lucide-react';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState(demoUsers[0]?.email ?? '');
  const [personaId, setPersonaId] = useState(demoUsers[0]?.id ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ email, password, personaId }),
      });

      if (!response.ok) {
        throw new Error('Unable to authenticate.');
      }

      router.replace(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 p-6">
      <div className="hidden md:flex flex-col justify-between rounded-3xl bg-[#212F34] text-white p-10 relative overflow-hidden shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(83,170,163,0.35), transparent 55%)' }} />
        <div className="relative z-10">
          <p className="uppercase tracking-[0.35em] text-xs mb-4 text-[#53AAA3]">Agilitas FinSight</p>
          <h1 className="text-4xl font-black leading-tight mb-6">
            CFO Copilot for
            <span className="block text-[#A3CADA]">real-time finance control.</span>
          </h1>
          <p className="text-sm text-slate-200 max-w-md">
            Stay on top of cash, risk, and performance metrics with frosted-glass dashboards, proactive alerts, and a chat-based financial analyst at your fingertips.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 text-[#DEEDF2]">
          <div className="bg-[#111A1B] rounded-2xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-400">Working Capital</p>
            <p className="text-2xl font-black text-[#53AAA3]">35 Days</p>
            <span className="text-xs text-slate-400">Target 42</span>
          </div>
          <div className="bg-[#111A1B] rounded-2xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-400">Net Margin</p>
            <p className="text-2xl font-black text-[#A3CADA]">12.5%</p>
            <span className="text-xs text-slate-400">+50 bps</span>
          </div>
          <div className="bg-[#111A1B] rounded-2xl p-4 border border-white/10">
            <p className="text-xs uppercase tracking-wide text-slate-400">ROIC</p>
            <p className="text-2xl font-black text-[#F8F4E1]">18.2%</p>
            <span className="text-xs text-slate-400">+120 bps</span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-[#A3CADA]/40 shadow-2xl p-8 transition-all duration-500 hover:shadow-[#A3CADA]/40">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#688790]">Secure console</p>
            <h2 className="text-3xl font-black text-[#212F34]">FinSight Login</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#688790]">SOC2 Ready</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#688790]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#A3CADA]/60 bg-[#F5FBFF] px-4 py-3 text-[#212F34] focus:outline-none focus:ring-2 focus:ring-[#53AAA3]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#688790]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#A3CADA]/60 bg-[#F5FBFF] px-4 py-3 text-[#212F34] focus:outline-none focus:ring-2 focus:ring-[#53AAA3]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#688790] mb-3">Choose a CFO persona</p>
            <div className="grid gap-3">
              {demoUsers.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => {
                    setPersonaId(user.id);
                    setEmail(user.email);
                  }}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                    personaId === user.id
                      ? 'border-[#53AAA3] bg-[#DEEDF2] shadow-lg'
                      : 'border-[#E2E8F0] bg-white/80'
                  }`}
                >
                  <p className="text-sm font-bold text-[#212F34]">{user.name}</p>
                  <p className="text-xs text-[#688790]">{user.title}</p>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#53AAA3] text-white py-4 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2"
          >
            {isLoading ? 'Entering Console…' : 'Enter Console'}
            <Sparkles className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-xs text-[#688790]">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#53AAA3]" />
            Live Financial Telemetry
          </div>
          <p>Version 1.0 · Cemantica AI</p>
        </div>
      </div>
    </div>
  );
}
