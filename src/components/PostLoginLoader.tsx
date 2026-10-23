import { useEffect, useRef, useState, type ReactNode } from 'react';

const MIN_MS = 3000;
const FADE_MS = 900;
const POST_LOGIN_KEY = 'nexus_post_login';

/** Mark that the user just signed in (call after successful signIn). */
export function markJustLoggedIn() {
  try {
    sessionStorage.setItem(POST_LOGIN_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

function consumeJustLoggedIn(): boolean {
  try {
    const v = sessionStorage.getItem(POST_LOGIN_KEY);
    if (!v) return false;
    sessionStorage.removeItem(POST_LOGIN_KEY);
    return Date.now() - Number(v) < 60_000;
  } catch {
    return false;
  }
}

/** Simple boot screen (session restore / hard refresh). */
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
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-11 h-11 rounded-full border-2 border-fuchsia-300/25 border-t-fuchsia-300 animate-spin" />
        <p className="text-sm text-fuchsia-100/70">{label}</p>
      </div>
    </div>
  );
}

/**
 * Post-login ceremony: spinning logo on glass card, status steps, progress line.
 * No system name / subtitle.
 */
export default function PostLoginLoader({
  label,
  subtitle: _subtitle,
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
      window.setTimeout(() => setStepIdx(1), 700),
      window.setTimeout(() => setStepIdx(2), 1500),
      window.setTimeout(() => setStepIdx(3), 2400),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const status = steps[Math.min(stepIdx, steps.length - 1)];
  const isReady = stepIdx >= steps.length - 1;

  return (
    <div
      className={`relative min-h-screen overflow-hidden flex items-center justify-center bg-[#0b0618] transition-opacity ease-out ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
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

      <div className="absolute left-0 right-0 top-1/2 -translate-y-[4.5rem] h-px pointer-events-none overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-fuchsia-400/80 to-violet-400/80"
          style={{ width: '40%', animation: 'pl-line 2.2s ease-in-out infinite' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_48px_rgba(167,139,250,0.4)] backdrop-blur-md"
          style={{ animation: isReady ? 'none' : 'pl-spin-logo 1.15s linear infinite' }}
        >
          <svg viewBox="0 0 48 48" width={40} height={40} fill="none" aria-hidden>
            <circle cx="24" cy="24" r="5.5" fill="white" />
            <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
          </svg>
        </div>

        <div className="mt-8 min-h-[1.5rem]">
          <p
            key={status}
            className={`text-sm font-medium ${isReady ? 'text-emerald-300/90' : 'text-fuchsia-100/90'}`}
          >
            {isReady ? '✓  ' : ''}
            {status}
          </p>
        </div>

        <div className="mt-6 w-52 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500 transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, ((stepIdx + 1) / steps.length) * 100)}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes pl-spin-logo { to { transform: rotate(360deg); } }
        @keyframes pl-drift {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(3%, 2%, 0); }
        }
        @keyframes pl-line {
          0% { transform: translateX(-100%); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: translateX(280%); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

/**
 * After a real sign-in: post-login ceremony ≥3s, fade, then children.
 * On hard refresh / session restore: skip ceremony (BootLoader only while !ready).
 */
export function PostLoginShell({
  ready,
  label,
  subtitle,
  variant = 'agent',
  children,
}: {
  ready: boolean;
  label: string;
  subtitle?: string;
  variant?: 'agent' | 'customer';
  children: ReactNode;
}) {
  const [mode, setMode] = useState<'boot' | 'ceremony' | 'fading' | 'done'>('boot');
  const readySince = useRef<number | null>(null);
  const ceremony = useRef(false);

  useEffect(() => {
    if (!ready) {
      readySince.current = null;
      ceremony.current = false;
      setMode('boot');
      return;
    }
    if (readySince.current == null) {
      readySince.current = Date.now();
      ceremony.current = consumeJustLoggedIn();
      if (!ceremony.current) {
        setMode('done');
        return;
      }
      setMode('ceremony');
    }
    if (!ceremony.current) return;

    const elapsed = Date.now() - (readySince.current || Date.now());
    const wait = Math.max(0, MIN_MS - elapsed);
    const t = window.setTimeout(() => setMode('fading'), wait);
    return () => window.clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (mode !== 'fading') return;
    const t = window.setTimeout(() => setMode('done'), FADE_MS);
    return () => window.clearTimeout(t);
  }, [mode]);

  if (!ready) {
    return <BootLoader label={label} />;
  }

  if (mode === 'ceremony' || mode === 'fading') {
    return (
      <PostLoginLoader label={label} subtitle={subtitle} fading={mode === 'fading'} variant={variant} />
    );
  }

  return <>{children}</>;
}
