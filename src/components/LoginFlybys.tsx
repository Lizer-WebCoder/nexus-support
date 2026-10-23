import { useEffect, useRef, useState } from 'react';

type FlybyKind = 'ufo' | 'rocket';
type RocketVariant = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type Flyby = {
  id: number;
  kind: FlybyKind;
  rocket?: RocketVariant;
  top: number;
  duration: number;
  dir: 'ltr' | 'rtl';
  chat?: string;
};

const CHATS = [
  'WOAH COOL',
  'Need backup?',
  'Branch online',
  'Tickets clear!',
  'Zoom zoom',
  'Nice UI!',
  'Hold my coffee',
  'Deployed!',
];

function Rocket0({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="58" height="28" viewBox="0 0 58 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="14" x2="18" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" /><stop offset="0.45" stopColor="#fbbf24" /><stop offset="1" stopColor="#fef08a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="8" cy="14" rx="8" ry="5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="5" cy="14" rx="4" ry="2.8" fill="#fff7ed" opacity="0.9" />
      <path d="M16 8 L22 14 L16 20 Z" fill="#fb923c" />
      <path d="M16 10 L20 14 L16 18 Z" fill="#fde68a" />
      <rect x="22" y="9" width="22" height="10" rx="3" fill="#f8fafc" />
      <rect x="24" y="11" width="18" height="6" rx="2" fill="#e2e8f0" />
      <path d="M44 9 Q56 14 44 19 Z" fill="#ef4444" />
      <path d="M46 11.5 Q52 14 46 16.5 Z" fill="#fca5a5" />
      <circle cx="36" cy="14" r="3.2" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="1.2" />
      <circle cx="35.2" cy="13.2" r="1" fill="#e0f2fe" opacity="0.9" />
      <path d="M24 9 L28 4 L32 9 Z" fill="#f97316" />
      <path d="M24 19 L28 24 L32 19 Z" fill="#f97316" />
    </svg>
  );
}

function Rocket1({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="56" height="28" viewBox="0 0 56 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="14" x2="16" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" /><stop offset="0.5" stopColor="#ec4899" /><stop offset="1" stopColor="#f9a8d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="7" cy="14" rx="7" ry="5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="4" cy="14" rx="3.5" ry="2.5" fill="#fce7f3" opacity="0.95" />
      <path d="M14 9 L20 14 L14 19 Z" fill="#c026d3" />
      <rect x="20" y="9.5" width="20" height="9" rx="4" fill="#e9d5ff" />
      <path d="M40 9.5 Q52 14 40 18.5 Z" fill="#a855f7" />
      <circle cx="32" cy="14" r="3" fill="#22d3ee" stroke="#06b6d4" strokeWidth="1.1" />
      <circle cx="31.3" cy="13.3" r="0.9" fill="#fff" opacity="0.9" />
      <path d="M22 9.5 L26 4 L30 9.5 Z" fill="#db2777" />
      <path d="M22 18.5 L26 24 L30 18.5 Z" fill="#db2777" />
    </svg>
  );
}

function Rocket2({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="54" height="28" viewBox="0 0 54 28" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="14" x2="15" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ea580c" /><stop offset="0.5" stopColor="#fb923c" /><stop offset="1" stopColor="#fdba74" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="6" cy="14" rx="6.5" ry="4.5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="3.5" cy="14" rx="3" ry="2.2" fill="#fff7ed" />
      <path d="M12 10 L18 14 L12 18 Z" fill="#c2410f" />
      <rect x="18" y="9" width="18" height="10" rx="5" fill="#fb923c" />
      <path d="M36 9 Q48 14 36 19 Z" fill="#ea580c" />
      <circle cx="28" cy="14" r="3.2" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.1" />
      <circle cx="27.3" cy="13.3" r="1" fill="#e0f2fe" />
      <ellipse cx="22" cy="8" rx="3" ry="2" fill="#f97316" />
      <ellipse cx="22" cy="20" rx="3" ry="2" fill="#f97316" />
    </svg>
  );
}

function Rocket3({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="52" height="30" viewBox="0 0 52 30" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="16" x2="14" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" /><stop offset="0.5" stopColor="#22d3ee" /><stop offset="1" stopColor="#a5f3fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="6" cy="16" rx="6" ry="4" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="3.5" cy="16" rx="2.8" ry="2" fill="#ecfeff" />
      <ellipse cx="28" cy="18" rx="18" ry="7" fill="#64748b" />
      <ellipse cx="28" cy="16" rx="16" ry="5.5" fill="#94a3b8" />
      <ellipse cx="28" cy="12" rx="10" ry="7" fill="#38bdf8" />
      <ellipse cx="28" cy="10" rx="7" ry="4.5" fill="#7dd3fc" />
      <circle cx="28" cy="10" r="2.5" fill="#0ea5e9" />
      <circle cx="26.5" cy="8.5" r="1" fill="#e0f2fe" opacity="0.85" />
    </svg>
  );
}

function Rocket4({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="50" height="30" viewBox="0 0 50 30" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="18" x2="14" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" /><stop offset="0.5" stopColor="#a78bfa" /><stop offset="1" stopColor="#ddd6fe" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="6" cy="18" rx="6" ry="4.5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="3.5" cy="18" rx="2.8" ry="2.2" fill="#f5f3ff" />
      <ellipse cx="26" cy="20" rx="16" ry="6" fill="#6366f1" />
      <ellipse cx="26" cy="18" rx="14" ry="5" fill="#818cf8" />
      <path d="M14 16 Q26 4 38 16" fill="#c4b5fd" />
      <path d="M18 15 Q26 8 34 15" fill="#a5b4fc" />
      <circle cx="26" cy="12" r="2.5" fill="#e0e7ff" />
      <circle cx="25" cy="11" r="1" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function Rocket5({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="58" height="26" viewBox="0 0 58 26" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="13" x2="16" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0d9488" /><stop offset="0.45" stopColor="#2dd4bf" /><stop offset="1" stopColor="#99f6e4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="7" cy="13" rx="7" ry="4.5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="4" cy="13" rx="3.2" ry="2.2" fill="#f0fdfa" />
      <path d="M14 8 L20 13 L14 18 Z" fill="#0f766e" />
      <rect x="20" y="8.5" width="22" height="9" rx="2.5" fill="#5eead4" />
      <path d="M42 8.5 Q56 13 42 17.5 Z" fill="#14b8a6" />
      <circle cx="32" cy="13" r="3" fill="#0ea5e9" stroke="#0369a1" strokeWidth="1" />
      <circle cx="31.3" cy="12.3" r="0.9" fill="#e0f2fe" />
      <path d="M22 8.5 L26 3 L30 8.5 Z" fill="#0d9488" />
      <path d="M22 17.5 L26 23 L30 17.5 Z" fill="#0d9488" />
    </svg>
  );
}

function Rocket6({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="56" height="26" viewBox="0 0 56 26" fill="none" aria-hidden>
      <defs>
        <linearGradient id={eid} x1="0" y1="13" x2="15" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#db2777" /><stop offset="0.45" stopColor="#f472b6" /><stop offset="1" stopColor="#fbcfe8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse className="login-ship-flame-core" cx="6.5" cy="13" rx="6.5" ry="4.5" fill={`url(#${eid})`} />
      <ellipse className="login-ship-flame-hot" cx="3.5" cy="13" rx="3" ry="2.2" fill="#fdf2f8" />
      <path d="M13 8.5 L19 13 L13 17.5 Z" fill="#9d174d" />
      <rect x="19" y="8.5" width="20" height="9" rx="4.5" fill="#f9a8d4" />
      <path d="M39 8.5 Q52 13 39 17.5 Z" fill="#ec4899" />
      <circle cx="30" cy="13" r="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.1" />
      <circle cx="29.3" cy="12.3" r="0.9" fill="#e0f2fe" />
      <path d="M21 8.5 L25 3.5 L29 8.5 Z" fill="#be185d" />
      <path d="M21 17.5 L25 22.5 L29 17.5 Z" fill="#be185d" />
    </svg>
  );
}

const ROCKETS = [Rocket0, Rocket1, Rocket2, Rocket3, Rocket4, Rocket5, Rocket6];

export function UfoIcon() {
  return (
    <svg className="login-ship-svg login-flyby-ufo" width="52" height="36" viewBox="0 0 52 36" fill="none" aria-hidden>
      <ellipse cx="26" cy="22" rx="22" ry="7" fill="#475569" />
      <ellipse cx="26" cy="20" rx="20" ry="6" fill="#64748b" />
      <ellipse cx="26" cy="18" rx="16" ry="5" fill="#94a3b8" />
      <ellipse cx="26" cy="12" rx="11" ry="9" fill="#38bdf8" />
      <ellipse cx="26" cy="10" rx="8" ry="6.5" fill="#7dd3fc" />
      <ellipse cx="26" cy="11" rx="5" ry="5.5" fill="#4ade80" />
      <circle cx="24" cy="10" r="1.3" fill="#14532d" />
      <circle cx="28" cy="10" r="1.3" fill="#14532d" />
      <path d="M24 13.5 Q26 15 28 13.5" stroke="#14532d" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="23.5" cy="9.5" r="0.4" fill="#fff" />
      <circle cx="27.5" cy="9.5" r="0.4" fill="#fff" />
      <circle cx="12" cy="20" r="1.6" fill="#fbbf24" />
      <circle cx="20" cy="22" r="1.6" fill="#f472b6" />
      <circle cx="32" cy="22" r="1.6" fill="#34d399" />
      <circle cx="40" cy="20" r="1.6" fill="#60a5fa" />
    </svg>
  );
}

function ShipExhaust() {
  return (
    <div className="login-ship-exhaust" aria-hidden>
      <span className="login-ship-smoke login-ship-smoke-a" />
      <span className="login-ship-smoke login-ship-smoke-b" />
      <span className="login-ship-smoke login-ship-smoke-c" />
      <span className="login-ship-ember login-ship-ember-a" />
      <span className="login-ship-ember login-ship-ember-b" />
      <span className="login-ship-ember login-ship-ember-c" />
      <span className="login-ship-ember login-ship-ember-d" />
    </div>
  );
}

function RocketIcon({ variant, exhaustId }: { variant: RocketVariant; exhaustId: string }) {
  const Comp = ROCKETS[variant] ?? Rocket0;
  return <Comp eid={exhaustId} />;
}

export function SpaceFlybys() {
  const [flybys, setFlybys] = useState<Flyby[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      if (cancelled) return;
      const id = ++idRef.current;
      const isUfo = Math.random() < 0.28;
      const kind: FlybyKind = isUfo ? 'ufo' : 'rocket';
      const rocket = (Math.floor(Math.random() * 7) as RocketVariant);
      const top = 12 + Math.random() * 62;
      const duration = 9 + Math.random() * 7;
      const dir: 'ltr' | 'rtl' = Math.random() < 0.5 ? 'ltr' : 'rtl';
      const chat = Math.random() < 0.55 ? CHATS[Math.floor(Math.random() * CHATS.length)] : undefined;

      setFlybys((prev) => [...prev.slice(-4), { id, kind, rocket, top, duration, dir, chat }]);
      setTimeout(() => {
        setFlybys((prev) => prev.filter((f) => f.id !== id));
      }, duration * 1000 + 200);

      const gaps = [18, 22, 26, 30, 35, 42, 50];
      timer = setTimeout(schedule, gaps[Math.floor(Math.random() * gaps.length)] * 1000);
    };

    timer = setTimeout(schedule, 6000 + Math.random() * 4000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="login-flybys absolute inset-0 pointer-events-none z-[4] overflow-hidden" aria-hidden>
      {flybys.map((f) => (
        <div
          key={f.id}
          className={`login-flyby login-flyby-${f.dir}`}
          style={{ top: `${f.top}%`, animationDuration: `${f.duration}s` }}
        >
          {f.chat && <div className="login-flyby-chat">{f.chat}</div>}
          <div className="login-flyby-craft">
            <div className="login-flyby-ship">
              <ShipExhaust />
              {f.kind === 'ufo' ? (
                <UfoIcon />
              ) : (
                <RocketIcon variant={f.rocket ?? 0} exhaustId={`rocketFlame-${f.id}`} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
