import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onOpenPortal?: () => void;
}

function useFallingStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 13) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        delay: -((i * 0.37) % 20),
        duration: 8 + (i % 11) * 1.4,
        color: i % 4 === 0 ? '#ff66cc' : i % 3 === 0 ? '#66f0ff' : '#c4b5fd',
        opacity: 0.35 + (i % 6) * 0.1,
      })),
    [count]
  );
}

function CosmicFallBackground() {
  const stars = useFallingStars(48);

  return (
    <div className="login-cosmos absolute inset-0 overflow-hidden" aria-hidden>
      <div className="login-cosmos-sky absolute inset-0" />
      <div className="login-nebula login-nebula-a absolute inset-0" />
      <div className="login-nebula login-nebula-b absolute inset-0" />

      <div className="login-beam absolute left-1/2 top-0 -translate-x-1/2">
        <div className="login-beam-core" />
        <div className="login-beam-glow" />
        <div className="login-beam-particles">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className="login-beam-spark"
              style={{
                left: `${20 + (i % 5) * 15}%`,
                animationDelay: `${i * 0.35}s`,
                animationDuration: `${2.2 + (i % 4) * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="login-planet login-planet-left" />
      <div className="login-planet login-planet-right" />
      <div className="login-ring" />

      <div className="login-starfield absolute inset-0">
        {stars.map((s) => (
          <span
            key={s.id}
            className="login-star absolute rounded-full"
            style={{
              left: s.left,
              width: s.size,
              height: s.size,
              background: s.color,
              opacity: s.opacity,
              boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="login-faller absolute left-1/2 top-[18%]">
        <svg width="44" height="52" viewBox="0 0 48 56" fill="none" className="login-faller-svg">
          <ellipse cx="24" cy="14" rx="8" ry="9" fill="#e8e0ff" />
          <path
            d="M16 22 C14 32 12 42 14 50 C18 48 22 44 24 40 C26 44 30 48 34 50 C36 42 34 32 32 22 Z"
            fill="#c4b5fd"
          />
          <path d="M10 28 C6 34 4 40 8 44" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
          <path d="M38 28 C42 34 44 40 40 44" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      <div className="login-cosmos-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
}

const CAPABILITIES = [
  { title: 'Omnichannel inbox', blurb: 'Portal, chat, and email land in one queue.' },
  { title: 'Branch-aware routing', blurb: 'Tickets stay with the right team automatically.' },
  { title: 'SLA + automations', blurb: 'Rules fire on create, priority, and breach.' },
];

export default function LoginPage({ onOpenPortal }: Props) {
  const { signIn, signUp, configError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim() || undefined);
        setInfo(
          'Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.'
        );
        setMode('signin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
      {/* Left — story + motion */}
      <aside className="relative min-h-[320px] lg:min-h-screen overflow-hidden">
        <CosmicFallBackground />

        <div className="relative z-10 h-full flex flex-col p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">Nexus Ops</div>
              <div className="text-[11px] text-fuchsia-200/70">Support operations platform</div>
            </div>
          </div>

          <div className="mt-12 lg:mt-16 max-w-lg">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fuchsia-300/80 mb-3">
              Built for agent teams
            </p>
            <h1 className="text-[1.85rem] sm:text-4xl font-semibold text-white leading-tight tracking-tight">
              Resolve faster.
              <span className="block text-fuchsia-200/90 font-normal mt-1">Stay organized across every branch.</span>
            </h1>
            <p className="mt-5 text-sm text-fuchsia-100/75 leading-relaxed max-w-md">
              Nexus Ops connects your customer portal, live chat, and agent desk. Route by branch,
              enforce SLAs, run macros, and give customers a clear path from request to resolution.
            </p>
          </div>

          <div className="mt-10 space-y-3 max-w-md">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3"
              >
                <div className="text-sm font-medium text-white">{c.title}</div>
                <div className="text-xs text-fuchsia-100/60 mt-0.5">{c.blurb}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-10 text-[11px] text-fuchsia-200/40">
            Agents only · Customers use the portal
          </div>
        </div>
      </aside>

      {/* Right — auth */}
      <main className="flex items-center justify-center bg-zinc-950 px-6 py-12 sm:px-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {mode === 'signin' ? 'Welcome back' : 'Join the desk'}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              {mode === 'signin'
                ? 'Sign in with your agent credentials.'
                : 'Create an agent account for this workspace.'}
            </p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-3 rounded-xl">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p className="text-amber-100/80">{configError}</p>
            </div>
          )}

          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
                setInfo('');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signin'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
                setInfo('');
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-lg whitespace-pre-wrap">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-lg">
                {info}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50"
                  placeholder="Alex Rivera"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-400">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-fuchsia-900/40"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Enter workspace' : 'Create agent account'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 space-y-2 text-center">
            <p className="text-xs text-zinc-500">
              Not an agent?{' '}
              <button
                type="button"
                onClick={onOpenPortal}
                className="text-fuchsia-400 hover:text-fuchsia-300 font-medium"
              >
                Open customer portal
              </button>
            </p>
            <p className="text-[11px] text-zinc-600">Need access? Ask your admin to approve your account.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
