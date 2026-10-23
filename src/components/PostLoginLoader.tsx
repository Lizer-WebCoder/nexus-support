import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const MIN_MS = 3200;
const FADE_MS = 1400;
const POST_LOGIN_KEY = 'nexus_post_login';

export function markJustLoggedIn() {
  try {
    sessionStorage.setItem(POST_LOGIN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function hasJustLoggedIn(): boolean {
  try {
    const v = sessionStorage.getItem(POST_LOGIN_KEY);
    if (!v) return false;
    return Date.now() - Number(v) < 90_000;
  } catch {
    return false;
  }
}

function clearJustLoggedIn() {
  try {
    sessionStorage.removeItem(POST_LOGIN_KEY);
  } catch {
    /* ignore */
  }
}

/** Compact logo for boot only. */
function LogoMark({ spinning }: { spinning: boolean }) {
  return (
    <div className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center shadow-[0_0_36px_rgba(167,139,250,0.35)] backdrop-blur-md">
      <svg viewBox="0 0 48 48" width={32} height={32} fill="none" aria-hidden>
        <circle cx="24" cy="24" r="5.5" fill="white" />
        <g style={{ transformOrigin: '24px 24px', animation: spinning ? 'pl-spin-ring 1.15s linear infinite' : 'none' }}>
          <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Line-art space scene (reference style): planet, ring, orbiting probe, stars.
 * Soft enter animation; continuous float/orbit while loading.
 */
function SpaceScene() {
  return (
    <div className="relative w-[200px] h-[160px] flex items-center justify-center" style={{ animation: 'pl-scene-in 0.85s cubic-bezier(0.22,1,0.36,1) both' }}>
      <svg viewBox="0 0 200 160" width="200" height="160" fill="none" aria-hidden className="overflow-visible">
        <defs>
          <linearGradient id="pl-planet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e879f9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
          <filter id="pl-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* distant stars */}
        <g opacity="0.9">
          <circle cx="28" cy="36" r="1.4" fill="#f5d0fe" style={{ animation: 'pl-twinkle 2.4s ease-in-out infinite' }} />
          <circle cx="168" cy="28" r="1.2" fill="#ddd6fe" style={{ animation: 'pl-twinkle 3s ease-in-out 0.4s infinite' }} />
          <circle cx="52" cy="22" r="1" fill="#f5d0fe" style={{ animation: 'pl-twinkle 2.1s ease-in-out 0.8s infinite' }} />
          <circle cx="150" cy="48" r="1.3" fill="#c4b5fd" style={{ animation: 'pl-twinkle 2.8s ease-in-out 0.2s infinite' }} />
          <circle cx="40" cy="120" r="1" fill="#e9d5ff" style={{ animation: 'pl-twinkle 3.2s ease-in-out 1s infinite' }} />
          <circle cx="175" cy="110" r="1.2" fill="#f5d0fe" style={{ animation: 'pl-twinkle 2.6s ease-in-out 0.6s infinite' }} />
          <circle cx="90" cy="18" r="1.1" fill="#ddd6fe" style={{ animation: 'pl-twinkle 2.2s ease-in-out 1.2s infinite' }} />
        </g>

        {/* soft nebula blobs */}
        <ellipse cx="70" cy="70" rx="36" ry="28" fill="#a855f7" opacity="0.08" />
        <ellipse cx="130" cy="95" rx="40" ry="30" fill="#6366f1" opacity="0.07" />

        {/* orbital path */}
        <ellipse
          cx="100"
          cy="88"
          rx="62"
          ry="22"
          stroke="#c4b5fd"
          strokeWidth="1.4"
          strokeDasharray="4 5"
          opacity="0.45"
          style={{ animation: 'pl-orbit-dash 8s linear infinite' }}
        />

        {/* planet body */}
        <g style={{ animation: 'pl-float 4.5s ease-in-out infinite alternate' }}>
          <circle cx="100" cy="88" r="28" fill="url(#pl-planet)" stroke="#e9d5ff" strokeWidth="2.2" filter="url(#pl-glow)" />
          {/* surface arcs */}
          <path d="M82 78c8-6 20-8 32-2" stroke="#f5d0fe" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          <path d="M78 92c10 4 22 6 36 2" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
          <path d="M88 102c6 3 14 4 22 1" stroke="#ddd6fe" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
          {/* highlight */}
          <circle cx="90" cy="78" r="5" fill="#faf5ff" opacity="0.35" />
        </g>

        {/* planetary ring */}
        <g style={{ transformOrigin: '100px 88px', animation: 'pl-ring-tilt 6s ease-in-out infinite alternate' }}>
          <ellipse cx="100" cy="88" rx="44" ry="10" stroke="#d8b4fe" strokeWidth="2" fill="none" opacity="0.75" />
          <ellipse cx="100" cy="88" rx="44" ry="10" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.35" strokeDasharray="2 6" />
        </g>

        {/* orbiting probe / satellite */}
        <g style={{ transformOrigin: '100px 88px', animation: 'pl-probe-orbit 5.5s linear infinite' }}>
          <g transform="translate(162, 88)">
            <rect x="-6" y="-3.5" width="12" height="7" rx="1.5" stroke="#f0abfc" strokeWidth="1.6" fill="#2e1065" fillOpacity="0.5" />
            <line x1="-10" y1="0" x2="-6" y2="0" stroke="#c4b5fd" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="6" y1="0" x2="10" y2="0" stroke="#c4b5fd" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="1.6" fill="#f5d0fe" />
          </g>
        </g>

        {/* small comet */}
        <g style={{ animation: 'pl-comet 7s linear infinite' }} opacity="0.8">
          <line x1="20" y1="50" x2="38" y2="58" stroke="#e9d5ff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
          <circle cx="38" cy="58" r="1.8" fill="#f5d0fe" />
        </g>
      </svg>
    </div>
  );
}

export function BootLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-[#0b0618]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 30%, rgba(88, 28, 135, 0.35), transparent 60%),' +
            'linear-gradient(180deg, #12082a 0%, #0b0618 100%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <LogoMark spinning />
        <p className="text-sm text-fuchsia-100/70">{label}</p>
      </div>
      <style>{`@keyframes pl-spin-ring { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function FloatingParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
        delay: `${(i * 0.37) % 6}s`,
        duration: `${10 + (i % 7) * 1.4}s`,
        opacity: 0.2 + (i % 5) * 0.08,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-fuchsia-200"
          style={{
            left: d.left,
            bottom: '-4%',
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            boxShadow: d.size > 2 ? '0 0 6px rgba(232,121,249,0.5)' : undefined,
            animation: `pl-particle-rise ${d.duration} linear infinite`,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function PostLoginLoader({
  label = 'Opening workspace…',
  fading = false,
  variant = 'agent',
}: {
  label?: string;
  subtitle?: string;
  fading?: boolean;
  variant?: 'agent' | 'customer';
}) {
  const steps =
    variant === 'customer'
      ? ['Verifying account…', 'Loading your tickets…', 'Preparing live chat…', 'Ready']
      : ['Verifying session…', 'Loading your desk…', 'Syncing tickets & chat…', 'Ready'];

  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStepIdx(1), 750),
      window.setTimeout(() => setStepIdx(2), 1600),
      window.setTimeout(() => setStepIdx(3), 2500),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const status = steps[Math.min(stepIdx, steps.length - 1)];
  const isReady = stepIdx >= steps.length - 1;
  const line = stepIdx === 0 && label ? label : status;
  const progress = Math.min(100, ((stepIdx + 1) / steps.length) * 100);

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex items-center justify-center bg-[#0b0618] ${
        fading ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
      }`}
      style={{
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 20% 10%, rgba(120, 40, 180, 0.45), transparent 55%),' +
            'radial-gradient(ellipse 90% 70% at 85% 25%, rgba(60, 20, 140, 0.5), transparent 50%),' +
            'radial-gradient(ellipse 80% 60% at 50% 95%, rgba(30, 10, 80, 0.6), transparent 55%),' +
            'linear-gradient(180deg, #1a0a3a 0%, #0b0618 45%, #05030e 100%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-80 h-80 rounded-full opacity-25 blur-3xl"
          style={{
            left: '12%',
            top: '18%',
            background: 'radial-gradient(circle, rgba(192,38,211,0.5), transparent 70%)',
            animation: 'pl-drift 11s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute w-[28rem] h-[28rem] rounded-full opacity-20 blur-3xl"
          style={{
            right: '8%',
            bottom: '12%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)',
            animation: 'pl-drift 15s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      <FloatingParticles />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <SpaceScene />

        <p
          key={line}
          className={`mt-5 text-sm font-medium tracking-wide ${
            isReady ? 'text-emerald-300/90' : 'text-fuchsia-100/90'
          }`}
        >
          {isReady ? '✓  ' : ''}
          {line}
        </p>

        <div className="mt-6 w-56 relative">
          <div className="h-[5px] rounded-full bg-white/[0.08] border border-white/10 overflow-hidden backdrop-blur-sm">
            <div
              className="relative h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed 0%, #d946ef 45%, #a78bfa 75%, #c084fc 100%)',
                boxShadow: '0 0 12px rgba(217, 70, 239, 0.55), 0 0 24px rgba(124, 58, 237, 0.25)',
              }}
            >
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                  animation: 'pl-shimmer 1.4s ease-in-out infinite',
                }}
              />
            </div>
          </div>
          <div
            className="absolute -bottom-2 left-0 h-3 rounded-full blur-md pointer-events-none transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: 'rgba(217, 70, 239, 0.35)',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pl-spin-ring { to { transform: rotate(360deg); } }
        @keyframes pl-drift {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(3%, 2%, 0); }
        }
        @keyframes pl-particle-rise {
          from { transform: translate3d(0, 0, 0) scale(0.6); opacity: 0; }
          12% { opacity: 0.85; }
          70% { opacity: 0.45; }
          to { transform: translate3d(8px, -110vh, 0) scale(1); opacity: 0; }
        }
        @keyframes pl-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes pl-scene-in {
          from { opacity: 0; transform: translateY(12px) scale(0.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pl-float {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
        @keyframes pl-ring-tilt {
          from { transform: rotate(-6deg); }
          to { transform: rotate(6deg); }
        }
        @keyframes pl-probe-orbit {
          to { transform: rotate(360deg); }
        }
        @keyframes pl-orbit-dash {
          to { stroke-dashoffset: -36; }
        }
        @keyframes pl-twinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @keyframes pl-comet {
          0% { transform: translate(-20px, -10px); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.5; }
          100% { transform: translate(160px, 40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function PostLoginShell({
  ready,
  label,
  variant = 'agent',
  children,
}: {
  ready: boolean;
  label: string;
  subtitle?: string;
  variant?: 'agent' | 'customer';
  children: ReactNode;
}) {
  const [mode, setMode] = useState<'wait' | 'ceremony' | 'fading' | 'done'>('wait');
  const started = useRef(false);
  const wantCeremony = useRef(false);

  useEffect(() => {
    if (!ready) {
      started.current = false;
      setMode('wait');
      return;
    }

    if (!started.current) {
      started.current = true;
      wantCeremony.current = hasJustLoggedIn();
      if (!wantCeremony.current) {
        setMode('done');
        return;
      }
      setMode('ceremony');
      const t = window.setTimeout(() => setMode('fading'), MIN_MS);
      return () => window.clearTimeout(t);
    }
  }, [ready]);

  useEffect(() => {
    if (mode !== 'fading') return;
    const t = window.setTimeout(() => {
      clearJustLoggedIn();
      setMode('done');
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [mode]);

  useEffect(() => {
    if (!ready || mode === 'ceremony' || mode === 'fading') return;
    if (!hasJustLoggedIn()) return;
    if (wantCeremony.current && mode === 'done') return;
    wantCeremony.current = true;
    started.current = true;
    setMode('ceremony');
    const t = window.setTimeout(() => setMode('fading'), MIN_MS);
    return () => window.clearTimeout(t);
  }, [ready, mode]);

  if (!ready || mode === 'wait') {
    return <BootLoader label={label} />;
  }

  if (mode === 'done' && !wantCeremony.current) {
    return <>{children}</>;
  }

  const showOverlay = mode === 'ceremony' || mode === 'fading';
  const showPortal = mode === 'fading' || mode === 'done';
  const overlayFading = mode === 'fading';

  return (
    <div className="relative min-h-screen bg-[#0b0618]">
      {showPortal && (
        <div
          className="relative z-0 min-h-screen"
          style={{
            opacity: mode === 'done' ? 1 : 0.92,
            animation:
              mode === 'done'
                ? 'pl-portal-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) both'
                : undefined,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {children}
        </div>
      )}

      {showOverlay && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            opacity: overlayFading ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          <PostLoginLoader label={label} fading={false} variant={variant} />
        </div>
      )}

      <style>{`
        @keyframes pl-portal-in {
          from { opacity: 0.85; filter: blur(6px); transform: scale(1.01); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
