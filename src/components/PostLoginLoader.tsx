import { useEffect, useRef, useState, type ReactNode } from 'react';

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
        <div
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_36px_rgba(167,139,250,0.35)]"
          style={{ animation: 'pl-spin-logo 1.15s linear infinite' }}
        >
          <svg viewBox="0 0 48 48" width={32} height={32} fill="none" aria-hidden>
            <circle cx="24" cy="24" r="5.5" fill="white" />
            <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
          </svg>
        </div>
        <p className="text-sm text-fuchsia-100/70">{label}</p>
      </div>
      <style>{`@keyframes pl-spin-logo { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Post-login ceremony (photo layout):
 * spinning logo card → status → progress bar.
 * No product name / platform subtitle. No separate spinner ring.
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
  // Prefer stepped status; fall back to label on first beat
  const line = stepIdx === 0 && label ? label : status;

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex items-center justify-center bg-[#0b0618] ${
        fading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
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

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Spinning logo on glass card — replaces separate spinner */}
        <div
          className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(167,139,250,0.4)] backdrop-blur-md"
          style={{ animation: isReady ? 'pl-pulse 1.2s ease-in-out infinite' : 'pl-spin-logo 1.1s linear infinite' }}
        >
          <svg viewBox="0 0 48 48" width={34} height={34} fill="none" aria-hidden>
            <circle cx="24" cy="24" r="5.5" fill="white" />
            <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
          </svg>
        </div>

        <p
          key={line}
          className={`text-sm font-medium ${isReady ? 'text-emerald-300/90' : 'text-fuchsia-100/90'}`}
        >
          {isReady ? '✓  ' : ''}
          {line}
        </p>

        <div className="mt-6 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, ((stepIdx + 1) / steps.length) * 100)}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pl-spin-logo { to { transform: rotate(360deg); } }
        @keyframes pl-pulse {
          0%, 100% { box-shadow: 0 0 28px rgba(167,139,250,0.35); }
          50% { box-shadow: 0 0 48px rgba(52,211,153,0.45); }
        }
        @keyframes pl-drift {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(3%, 2%, 0); }
        }
      `}</style>
    </div>
  );
}

/**
 * After sign-in: ceremony ≥3s + smooth fade, then children.
 * Hard refresh: skip ceremony (children as soon as ready).
 * Flag is only cleared after the ceremony finishes (survives Strict Mode).
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

  // Re-arm ceremony if flag appears while already ready (login race)
  useEffect(() => {
    if (!ready || mode === 'ceremony' || mode === 'fading') return;
    if (!hasJustLoggedIn()) return;
    if (wantCeremony.current && mode === 'done') return; // already played
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
      className="min-h-screen animate-[pl-fadein_0.7s_cubic-bezier(0.22,1,0.36,1)]"
      style={{ animationFillMode: 'both' }}
    >
      {children}
      <style>{`
        @keyframes pl-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
