import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

const MIN_MS = 3200;
const FADE_MS = 1200;
const POST_LOGIN_KEY = 'nexus_post_login';

/** Call before/after successful signIn so the ceremony always runs. */
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

function LogoMark({ spinning }: { spinning: boolean }) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(167,139,250,0.35)] backdrop-blur-md">
      <svg viewBox="0 0 48 48" width={36} height={36} fill="none" aria-hidden>
        {/* core stays still */}
        <circle cx="24" cy="24" r="5.5" fill="white" />
        {/* only the ring arcs spin */}
        <g
          style={{
            transformOrigin: '24px 24px',
            animation: spinning ? 'pl-spin-ring 1.15s linear infinite' : 'none',
          }}
        >
          <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

/** Simple boot screen (hard refresh / session restore). */
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
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 11) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1.5,
        delay: `${(i * 0.37) % 6}s`,
        duration: `${10 + (i % 7) * 1.4}s`,
        opacity: 0.25 + (i % 5) * 0.1,
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
            boxShadow: d.size > 2 ? '0 0 6px rgba(232,121,249,0.6)' : undefined,
            animation: `pl-particle-rise ${d.duration} linear infinite`,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Post-login ceremony:
 * still glass card, spinning ring only, status + richer progress bar, particles.
 */
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

      {/* soft nebula orbs */}
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
        <LogoMark spinning={!isReady} />

        <p
          key={line}
          className={`mt-7 text-sm font-medium tracking-wide ${
            isReady ? 'text-emerald-300/90' : 'text-fuchsia-100/90'
          }`}
        >
          {isReady ? '✓  ' : ''}
          {line}
        </p>

        {/* richer progress track */}
        <div className="mt-7 w-56 relative">
          <div className="h-[5px] rounded-full bg-white/[0.08] border border-white/10 overflow-hidden backdrop-blur-sm">
            <div
              className="relative h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, #7c3aed 0%, #d946ef 45%, #a78bfa 75%, #c084fc 100%)',
                boxShadow: '0 0 12px rgba(217, 70, 239, 0.55), 0 0 24px rgba(124, 58, 237, 0.25)',
              }}
            >
              {/* shimmer */}
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
          {/* soft glow under bar */}
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
          from {
            transform: translate3d(0, 0, 0) scale(0.6);
            opacity: 0;
          }
          12% { opacity: 0.85; }
          70% { opacity: 0.45; }
          to {
            transform: translate3d(8px, -110vh, 0) scale(1);
            opacity: 0;
          }
        }
        @keyframes pl-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
}

/**
 * After sign-in: ceremony ≥3s + smooth fade, then children.
 * Hard refresh: skip ceremony (children as soon as ready).
 */
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

  if (mode === 'ceremony' || mode === 'fading') {
    return <PostLoginLoader label={label} fading={mode === 'fading'} variant={variant} />;
  }

  return (
    <div
      className="min-h-screen"
      style={{
        animation: 'pl-fadein 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      {children}
      <style>{`
        @keyframes pl-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
