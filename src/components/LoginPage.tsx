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

function NexusLogoMark({ size = 56 }: { size?: number }) {
  return (
    <div className="login-logo-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
        <circle cx="24" cy="24" r="5.5" fill="white" className="login-logo-core" />
        <g className="login-logo-arcs">
          <path
            d="M24 6a18 18 0 0 1 18 18"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M24 42a18 18 0 0 1-18-18"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      </svg>
    </div>
  );
}

/** Deterministic-but-varied rock params (stable across renders). */
function useAsteroids(count: number) {
  return useMemo(() => {
    const radii = [
      '42% 58% 48% 52%',
      '60% 40% 55% 45%',
      '35% 65% 50% 50%',
      '55% 45% 38% 62%',
      '48% 52% 60% 40%',
      '65% 35% 45% 55%',
      '40% 60% 42% 58%',
      '50% 50% 35% 65%',
    ];
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 17 + 11) % 97;
      return {
        id: i,
        size: 10 + (seed % 18),
        radius: radii[i % radii.length],
        // horizontal start across lower zone (toward center lane)
        left: 38 + ((seed * 3) % 28),
        delay: -((i * 2.1) % 14),
        duration: 9 + (seed % 7),
        // slight horizontal drift while rising
        drift: (seed % 2 === 0 ? 1 : -1) * (20 + (seed % 40)),
        rotate: 120 + (seed % 200),
        hue: 240 + (seed % 40),
      };
    });
  }, [count]);
}

function LogoPilotStage() {
  const asteroids = useAsteroids(6);

  return (
    <div className="login-pilot-stage absolute inset-0 pointer-events-none z-[5] hidden lg:block" aria-hidden>
      {/* Rocks rise from bottom toward the logo lane */}
      {asteroids.map((a) => (
        <span
          key={a.id}
          className="login-asteroid"
          style={{
            width: a.size,
            height: a.size,
            left: `${a.left}%`,
            borderRadius: a.radius,
            animationDelay: `${a.delay}s`,
            animationDuration: `${a.duration}s`,
            // CSS vars for path drift
            ['--rock-drift' as string]: `${a.drift}px`,
            ['--rock-spin' as string]: `${a.rotate}deg`,
            background: `radial-gradient(circle at 32% 28%, hsl(${a.hue} 25% 55%), hsl(${a.hue} 30% 18%) 72%)`,
          }}
        />
      ))}

      {/* Logo + motion trail */}
      <div className="login-pilot">
        <span className="login-pilot-trail login-pilot-trail-1" />
        <span className="login-pilot-trail login-pilot-trail-2" />
        <span className="login-pilot-trail login-pilot-trail-3" />
        <span className="login-pilot-trail login-pilot-trail-4" />
        <div className="login-pilot-glow" />
        <NexusLogoMark size={64} />
      </div>
    </div>
  );
}

function CosmicFallBackground() {
  const stars = useFallingStars(64);

  return (
    <div className="login-cosmos absolute inset-0 overflow-hidden" aria-hidden>
      <div className="login-cosmos-sky absolute inset-0" />
      <div className="login-nebula login-nebula-a absolute inset-0" />
      <div className="login-nebula login-nebula-b absolute inset-0" />

      <div className="login-beam absolute left-1/2 top-0 -translate-x-1/2 opacity-60">
        <div className="login-beam-core" />
        <div className="login-beam-glow" />
        <div className="login-beam-particles">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="login-beam-spark"
              style={{
                left: `${20 + (i % 5) * 15}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2.4 + (i % 4) * 0.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="login-planet login-planet-main" />
      <div className="login-planet-ring" />
      <div className="login-planet login-planet-far" />

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

      <LogoPilotStage />

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
    <div className="relative min-h-screen overflow-hidden">
      <CosmicFallBackground />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1fr_minmax(340px,420px)] gap-6 lg:gap-10 px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
        <div className="flex flex-col min-h-[280px] lg:min-h-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
              <NexusLogoMark size={22} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">Nexus Ops</div>
              <div className="text-[11px] text-fuchsia-200/70">Support operations platform</div>
            </div>
          </div>

          <div className="mt-10 lg:mt-14 max-w-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-fuchsia-300/80 mb-3">
              Built for agent teams
            </p>
            <h1 className="text-[1.85rem] sm:text-4xl font-semibold text-white leading-tight tracking-tight">
              Resolve faster.
              <span className="block text-fuchsia-200/90 font-normal mt-1">
                Stay organized across every branch.
              </span>
            </h1>
            <p className="mt-5 text-sm text-fuchsia-100/75 leading-relaxed">
              Nexus Ops connects your customer portal, live chat, and agent desk. Route by branch,
              enforce SLAs, run macros, and give customers a clear path from request to resolution.
            </p>
          </div>

          <div className="mt-8 space-y-3 max-w-md">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-4 py-3"
              >
                <div className="text-sm font-medium text-white">{c.title}</div>
                <div className="text-xs text-fuchsia-100/60 mt-0.5">{c.blurb}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8 text-[11px] text-fuchsia-200/40">
            Agents only · Customers use the portal
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end relative z-20">
          <div className="w-full max-w-[380px] rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.35)] p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Join the desk'}
              </h2>
              <p className="mt-1.5 text-sm text-fuchsia-100/60">
                {mode === 'signin'
                  ? 'Sign in with your agent credentials.'
                  : 'Create an agent account for this workspace.'}
              </p>
            </div>

            {configError && (
              <div className="mb-4 text-sm text-amber-100 bg-amber-500/15 border border-amber-400/30 px-3 py-3 rounded-xl">
                <p className="font-medium mb-1">Supabase configuration problem</p>
                <p className="text-amber-100/80">{configError}</p>
              </div>
            )}

            <div className="flex gap-1 p-1 rounded-xl bg-black/25 border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setInfo('');
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === 'signin'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-fuchsia-100/70 hover:text-white'
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
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-fuchsia-100/70 hover:text-white'
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="text-sm text-rose-200 bg-rose-500/15 border border-rose-400/30 px-3 py-2 rounded-lg whitespace-pre-wrap">
                  {error}
                </div>
              )}
              {info && (
                <div className="text-sm text-emerald-200 bg-emerald-500/15 border border-emerald-400/30 px-3 py-2 rounded-lg">
                  {info}
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-fuchsia-100/70 mb-1.5">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/50"
                    placeholder="Alex Rivera"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-fuchsia-100/70 mb-1.5">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/50"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-fuchsia-100/70">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-[11px] font-medium text-fuchsia-200/50 hover:text-fuchsia-100"
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
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-black/30 border border-white/15 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 focus:border-fuchsia-400/50"
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

            <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-center">
              <p className="text-xs text-fuchsia-100/50">
                Not an agent?{' '}
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-fuchsia-300 hover:text-white font-medium"
                >
                  Open customer portal
                </button>
              </p>
              <p className="text-[11px] text-fuchsia-100/35">
                Need access? Ask your admin to approve your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
