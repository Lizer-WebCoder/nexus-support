import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onOpenPortal?: () => void;
}

function useParticles(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: 1.5 + (i % 4) * 0.8,
        delay: (i % 12) * 0.4,
        duration: 8 + (i % 7) * 1.5,
        opacity: 0.25 + (i % 5) * 0.12,
      })),
    [count]
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
  const particles = useParticles(48);

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
        setInfo('Account created. If email confirmation is enabled in Supabase, check your inbox before signing in.');
        setMode('signin');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-galaxy relative min-h-screen flex flex-col overflow-hidden">
      <div className="login-galaxy-gradient absolute inset-0" aria-hidden />
      <div className="login-honeycomb absolute inset-0" aria-hidden />

      <svg
        className="login-network absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(167,139,250,0)" />
            <stop offset="40%" stopColor="rgba(167,139,250,0.55)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
        </defs>
        <g
          className="login-network-lines"
          stroke="url(#lineGrad)"
          strokeWidth="0.15"
          fill="none"
          strokeDasharray="0.8 1.2"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M5 20 L25 35 L40 18 L55 42 L70 28 L90 48" />
          <path d="M10 70 L30 55 L48 72 L65 50 L82 68 L95 45" />
          <path d="M15 40 L35 60 L50 38 L72 58 L88 32" />
          <path d="M2 50 L20 25 L45 55 L60 20 L85 60 L98 30" />
          <path d="M8 85 L28 75 L50 90 L75 70 L92 85" />
        </g>
        <g fill="rgba(196,181,253,0.75)">
          <circle className="login-node" cx="25" cy="35" r="0.45" />
          <circle className="login-node" cx="40" cy="18" r="0.35" />
          <circle className="login-node" cx="55" cy="42" r="0.45" />
          <circle className="login-node" cx="30" cy="55" r="0.35" />
          <circle className="login-node" cx="65" cy="50" r="0.45" />
          <circle className="login-node" cx="48" cy="72" r="0.35" />
          <circle className="login-node" cx="72" cy="58" r="0.35" />
          <circle className="login-node" cx="45" cy="55" r="0.45" />
        </g>
      </svg>

      <div className="login-particles absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className="login-particle absolute rounded-full bg-violet-200"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="login-vignette absolute inset-0 pointer-events-none" aria-hidden />

      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/40">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white tracking-tight drop-shadow-sm">Nexus Ops</h1>
            <p className="text-sm text-violet-200/80 mt-1">Agent support desk</p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-100 bg-amber-500/15 border border-amber-400/30 px-3 py-3 rounded-xl backdrop-blur-sm">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p className="text-amber-100/90">{configError}</p>
            </div>
          )}

          <div className="login-card-glow bg-white rounded-2xl border border-zinc-200 shadow-card p-6">
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
                <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg whitespace-pre-wrap">{error}</div>
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
                className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create agent account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-violet-200/60 mt-6">
            Customers should use the{' '}
            <button
              type="button"
              onClick={onOpenPortal}
              className="text-violet-200 hover:text-white hover:underline font-medium"
            >
              customer portal
            </button>
            {' '}— no login required.
          </p>
        </div>
      </div>
    </div>
  );
}
