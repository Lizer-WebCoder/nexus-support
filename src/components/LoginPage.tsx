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

/** Cosmic void — continuous fall (stars rush upward = you fall forever). */
function CosmicFallBackground() {
  const stars = useFallingStars(56);

  return (
    <div className="login-cosmos absolute inset-0 overflow-hidden" aria-hidden>
      <div className="login-cosmos-sky absolute inset-0" />

      {/* Nebula layers drifting slowly */}
      <div className="login-nebula login-nebula-a absolute inset-0" />
      <div className="login-nebula login-nebula-b absolute inset-0" />

      {/* Energy beam from above */}
      <div className="login-beam absolute left-1/2 top-0 -translate-x-1/2">
        <div className="login-beam-core" />
        <div className="login-beam-glow" />
        <div className="login-beam-particles">
          {Array.from({ length: 12 }, (_, i) => (
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

      {/* Planet arcs */}
      <div className="login-planet login-planet-left" />
      <div className="login-planet login-planet-right" />
      <div className="login-ring" />

      {/* Stars rushing upward = falling sensation */}
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

      {/* Falling silhouette */}
      <div className="login-faller absolute left-1/2 top-[28%]">
        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" className="login-faller-svg">
          {/* Simple original figure — not a game asset */}
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

export default function LoginPage({ onOpenPortal }: Props) {
  const { signIn, signUp, configError } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <CosmicFallBackground />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-fuchsia-500/40 ring-2 ring-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path
                  d="M12 21a9 9 0 0 1-9-9"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(192,38,211,0.5)]">
              Nexus Ops
            </h1>
            <p className="text-sm text-fuchsia-200/90 mt-1">Agent support desk</p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-100 bg-amber-500/20 border border-amber-400/40 px-3 py-3 rounded-xl backdrop-blur-sm">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p className="text-amber-100/90">{configError}</p>
            </div>
          )}

          <div className="login-card-glow bg-white rounded-2xl border border-zinc-200/80 p-6">
            <div className="flex rounded-lg bg-zinc-100 p-1 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signin' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
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
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signup' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                  {error}
                </div>
              )}
              {info && (
                <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{info}</div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                    placeholder="Sarah Chen"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white text-sm font-semibold rounded-lg hover:from-fuchsia-500 hover:to-violet-500 disabled:opacity-50 transition-colors shadow-md shadow-fuchsia-500/25"
              >
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create agent account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-fuchsia-200/70 mt-6">
            Customers use the{' '}
            <button
              type="button"
              onClick={onOpenPortal}
              className="text-fuchsia-100 font-semibold underline underline-offset-2 hover:text-white"
            >
              customer portal
            </button>
            {' '}(account + admin approval required).
          </p>
        </div>
      </div>
    </div>
  );
}
