import { useEffect, useMemo, useRef, useState } from 'react';
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

function useAsteroids(count: number) {
  return useMemo(() => {
    const radii = [
      '42% 58% 48% 52%',
      '60% 40% 55% 45%',
      '35% 65% 50% 50%',
      '55% 45% 38% 62%',
      '48% 52% 60% 40%',
      '65% 35% 45% 55%',
    ];
    // Spread across lower third so logo can dodge while flying
    const starts = [18, 28, 38, 55, 68, 78];

    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 17 + 11) % 97;
      const left = starts[i % starts.length] + (seed % 4);
      const drift = (seed % 2 === 0 ? 1 : -1) * (10 + (seed % 30));

      return {
        id: i,
        size: 10 + (seed % 14),
        radius: radii[i % radii.length],
        left,
        delay: -((i * 2.6) % 18),
        duration: 11 + (seed % 7),
        drift,
        rotate: 100 + (seed % 220),
        hue: 235 + (seed % 45),
      };
    });
  }, [count]);
}

type TrailPoint = { x: number; y: number };

const TRAIL_LEN = 36;

function LogoPilotStage() {
  const asteroids = useAsteroids(5);
  const pilotRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const history = useRef<TrailPoint[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [stageSize, setStageSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    let raf = 0;
    let lastSample = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - lastSample < 22) return;
      lastSample = t;

      const pilot = pilotRef.current;
      const stage = stageRef.current;
      if (!pilot || !stage) return;

      const pr = pilot.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      setStageSize({ w: sr.width, h: sr.height });

      const x = pr.left + pr.width / 2 - sr.left;
      const y = pr.top + pr.height / 2 - sr.top;

      const prev = history.current[0];
      if (prev && Math.hypot(prev.x - x, prev.y - y) < 2) {
        if (history.current.length > 3) {
          history.current = history.current.slice(0, -1);
          setTrail([...history.current]);
        }
        return;
      }

      history.current = [{ x, y }, ...history.current].slice(0, TRAIL_LEN);
      setTrail([...history.current]);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Smooth quadratic path for a continuous shooting-star ribbon
  const pathD = useMemo(() => {
    if (trail.length < 2) return '';
    let d = `M ${trail[0].x.toFixed(1)} ${trail[0].y.toFixed(1)}`;
    for (let i = 1; i < trail.length - 1; i++) {
      const midX = (trail[i].x + trail[i + 1].x) / 2;
      const midY = (trail[i].y + trail[i + 1].y) / 2;
      d += ` Q ${trail[i].x.toFixed(1)} ${trail[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
    }
    const last = trail[trail.length - 1];
    d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
    return d;
  }, [trail]);

  return (
    <div
      ref={stageRef}
      className="login-pilot-stage absolute inset-0 pointer-events-none z-[5] hidden lg:block"
      aria-hidden
    >
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
            ['--rock-drift' as string]: `${a.drift}px`,
            ['--rock-spin' as string]: `${a.rotate}deg`,
            background: `radial-gradient(circle at 32% 28%, hsl(${a.hue} 28% 52%), hsl(${a.hue} 32% 16%) 72%)`,
          }}
        />
      ))}

      {pathD && (
        <svg
          className="login-light-trail absolute inset-0 w-full h-full overflow-visible"
          width={stageSize.w}
          height={stageSize.h}
          viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
        >
          <defs>
            <linearGradient
              id="starTrailGrad"
              gradientUnits="userSpaceOnUse"
              x1={trail[0]?.x ?? 0}
              y1={trail[0]?.y ?? 0}
              x2={trail[trail.length - 1]?.x ?? 0}
              y2={trail[trail.length - 1]?.y ?? 0}
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="12%" stopColor="#fce7f3" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#e879f9" stopOpacity="0.65" />
              <stop offset="65%" stopColor="#c026d3" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#701a75" stopOpacity="0" />
            </linearGradient>
            <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="starBloom" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          {/* Wide bloom — soft shooting-star wash */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#starTrailGrad)"
            strokeWidth={42}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#starBloom)"
            opacity={0.45}
          />

          {/* Mid ribbon */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#starTrailGrad)"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#starGlow)"
            opacity={0.9}
          />

          {/* Hot white core */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        </svg>
      )}

      {/* Spark particles along trail */}
      {trail.slice(2, 14).map((p, i) => {
        const t = i / 12;
        return (
          <span
            key={`spark-${i}-${Math.round(p.x)}-${Math.round(p.y)}`}
            className="login-trail-spark"
            style={{
              left: p.x + ((i % 3) - 1) * 6,
              top: p.y + ((i % 2) * 4 - 2),
              opacity: Math.max(0, 0.7 * (1 - t)),
              width: 3 + (1 - t) * 3,
              height: 3 + (1 - t) * 3,
            }}
          />
        );
      })}

      <div ref={pilotRef} className="login-pilot">
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
