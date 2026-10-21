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

      <div className="login-faller absolute left-1/2 top-[22%]">
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

const FEATURES = [
  'Live chat & tickets',
  'Branch routing',
  'SLA & automations',
  'Customer portal',
  'Macros & KB',
  'CSAT surveys',
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ===== Left: animation + product story ===== */}
      <aside className="relative lg:w-[48%] xl:w-[52%] min-h-[280px] lg:min-h-screen flex flex-col overflow-hidden">
        <CosmicFallBackground />

        <div className="relative z-10 flex flex-col flex-1 p-8 sm:p-10 lg:p-12 xl:p-14">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-fuchsia-200/90">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            Tech support system
          </div>

          <div className="mt-auto mb-auto py-10 lg:py-0">
            <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
              One desk for
              <br />
              every ticket.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-fuchsia-100/85 max-w-md leading-relaxed">
              Nexus Ops is a multi-branch support platform for agents and customers. Open tickets from
              the portal or live chat, route by branch, hit SLAs with automations, and keep every
              conversation in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {FEATURES.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-fuchsia-50 bg-white/10 border border-white/15 backdrop-blur-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-fuchsia-200/50 mt-8 lg:mt-0">
            Nexus Ops · Agent workspace · {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* ===== Right: auth form ===== */}
      <main className="flex-1 flex items-center justify-center bg-[#f7f8fb] px-6 py-10 sm:px-10">
        <div className="w-full max-w-[380px]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/25">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            <p className="mt-4 text-[11px] font-semibold tracking-[0.16em] uppercase text-zinc-400">
              Agent portal
            </p>
            <h2 className="mt-1 text-2xl font-bold text-zinc-900 tracking-tight">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              {mode === 'signin'
                ? 'Enter your credentials to open the support desk.'
                : 'Register an agent account for your workspace.'}
            </p>
          </div>

          {configError && (
            <div className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 px-3 py-3 rounded-xl">
              <p className="font-medium mb-1">Supabase configuration problem</p>
              <p className="text-amber-700/90">{configError}</p>
            </div>
          )}

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
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Full name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400"
                  placeholder="Sarah Chen"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Work email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" aria-hidden>
                  ✉
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
              <div className="relative flex">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" aria-hidden>
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-16 py-2.5 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-semibold tracking-wide text-zinc-500 hover:text-zinc-800"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 bg-zinc-900 text-white text-sm font-semibold rounded-xl hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create agent account'}
              {!loading && <span aria-hidden>→</span>}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-8">
            Customers use the{' '}
            <button
              type="button"
              onClick={onOpenPortal}
              className="text-violet-600 font-medium hover:underline"
            >
              customer portal
            </button>
            {' '}(account + admin approval required).
          </p>
          <p className="text-center text-xs text-zinc-400 mt-2">
            Trouble signing in? Contact your administrator.
          </p>
        </div>
      </main>
    </div>
  );
}
