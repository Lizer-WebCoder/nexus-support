import { useEffect } from 'react';

/** Cosmic post-login / route-loading screen — matches login gradient. */
export default function PostLoginLoader({
  label = 'Loading…',
  subtitle,
}: {
  label?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-[#0b0618]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 20% 10%, rgba(120, 40, 180, 0.5), transparent 55%),' +
            'radial-gradient(ellipse 90% 70% at 85% 25%, rgba(60, 20, 140, 0.55), transparent 50%),' +
            'radial-gradient(ellipse 80% 60% at 50% 95%, rgba(30, 10, 80, 0.65), transparent 55%),' +
            'linear-gradient(180deg, #1a0a3a 0%, #0b0618 45%, #05030e 100%)',
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{
            left: '10%',
            top: '20%',
            background: 'radial-gradient(circle, rgba(192,38,211,0.55), transparent 70%)',
            animation: 'postlogin-drift 10s ease-in-out infinite alternate',
          }}
        />
        <div
          className="absolute w-96 h-96 rounded-full opacity-25 blur-3xl"
          style={{
            right: '5%',
            bottom: '10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)',
            animation: 'postlogin-drift 14s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(167,139,250,0.45)]"
          style={{ animation: 'postlogin-pulse 2.2s ease-in-out infinite' }}
        >
          <svg viewBox="0 0 48 48" width={36} height={36} fill="none" aria-hidden>
            <circle cx="24" cy="24" r="5.5" fill="white" />
            <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
          </svg>
        </div>

        <div className="text-lg font-semibold text-white tracking-tight">Nexus Ops</div>
        <div className="mt-1 text-xs text-fuchsia-200/70">Support operations platform</div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-fuchsia-300/20 border-t-fuchsia-300 border-r-violet-400"
            style={{ animation: 'postlogin-spin 0.9s linear infinite' }}
          />
          <p className="text-sm text-fuchsia-100/90 font-medium">{label}</p>
          {subtitle ? <p className="text-xs text-fuchsia-200/55 max-w-xs">{subtitle}</p> : null}
        </div>

        <div className="mt-8 w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500"
            style={{ animation: 'postlogin-bar 1.4s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes postlogin-spin { to { transform: rotate(360deg); } }
        @keyframes postlogin-pulse {
          0%, 100% { box-shadow: 0 0 28px rgba(167,139,250,0.35); transform: scale(1); }
          50% { box-shadow: 0 0 48px rgba(217,70,239,0.55); transform: scale(1.04); }
        }
        @keyframes postlogin-drift {
          from { transform: translate3d(0,0,0); }
          to { transform: translate3d(4%, 3%, 0); }
        }
        @keyframes postlogin-bar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}

export function useMinDisplay(ms: number, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => undefined, ms);
    return () => window.clearTimeout(t);
  }, [ms, active]);
}
