import { useEffect, useRef, useState } from 'react';

const CHAT_LINES = [
  'WOAH COOL', 'NICE TRAIL!', 'Is that Nexus?', 'Sick logo', 'Beep boop', 'Over here!',
  'Support desk?', 'Zoom!', 'Hello agents', 'To the branch!', 'Copy that', 'Need backup?',
  'Tickets flying!', 'SLA green', 'Branch online', 'Portal live', 'Route me in', 'Clear skies',
  'Warp speed', 'Got a ticket?',
];

type Flyby = { id: number; kind: 'ufo' | 'ship'; top: number; duration: number; fromLeft: boolean; chat: string | null };

/** Cartoon green alien in classic flying saucer (matches reference) */
export function UfoIcon() {
  return (
    <svg width="96" height="64" viewBox="0 0 96 64" fill="none" aria-hidden className="login-ufo-svg">
      {/* Dome glass */}
      <ellipse cx="48" cy="28" rx="26" ry="22" fill="url(#ufoDome)" opacity="0.92" />
      <ellipse cx="48" cy="28" rx="26" ry="22" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.7" />
      {/* Alien body */}
      <ellipse cx="48" cy="36" rx="10" ry="12" fill="#7cb342" />
      {/* Alien head */}
      <ellipse cx="48" cy="24" rx="12" ry="11" fill="#8bc34a" />
      {/* Eyes */}
      <ellipse cx="42.5" cy="23" rx="4.2" ry="5" fill="#1e293b" />
      <ellipse cx="53.5" cy="23" rx="4.2" ry="5" fill="#1e293b" />
      <ellipse cx="43.5" cy="21.5" rx="1.4" ry="1.6" fill="#e0f2fe" />
      <ellipse cx="54.5" cy="21.5" rx="1.4" ry="1.6" fill="#e0f2fe" />
      {/* Smile */}
      <path d="M44 29 Q48 32 52 29" stroke="#33691e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Waving hand */}
      <g transform="translate(58,18) rotate(-20)">
        <ellipse cx="0" cy="0" rx="4" ry="5" fill="#8bc34a" />
        <path d="M-2 -4 L-1 -9 M0 -5 L1 -10 M2 -4 L3 -9" stroke="#8bc34a" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {/* Saucer top rim */}
      <ellipse cx="48" cy="42" rx="40" ry="10" fill="url(#ufoRimTop)" />
      {/* Saucer body */}
      <ellipse cx="48" cy="46" rx="42" ry="12" fill="url(#ufoBody)" />
      <ellipse cx="48" cy="44" rx="38" ry="7" fill="#6366f1" opacity="0.35" />
      {/* Lights */}
      <circle cx="22" cy="46" r="3.2" fill="#fbbf24" />
      <circle cx="34" cy="49" r="3.2" fill="#fde047" />
      <circle cx="48" cy="50" r="3.4" fill="#fbbf24" />
      <circle cx="62" cy="49" r="3.2" fill="#fde047" />
      <circle cx="74" cy="46" r="3.2" fill="#fbbf24" />
      {/* Soft glow under saucer */}
      <ellipse cx="48" cy="56" rx="18" ry="4" fill="#a5b4fc" opacity="0.25" />
      <defs>
        <radialGradient id="ufoDome" cx="45%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#7dd3fc" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id="ufoRimTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="ufoBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Classic cartoon red/white rocket matching reference */
export function ShipIcon({ exhaustId = 'rocketFlame' }: { exhaustId?: string }) {
  return (
    <svg width="100" height="48" viewBox="0 0 100 48" fill="none" aria-hidden className="login-ship-svg">
      {/* Exhaust plume (behind ship) */}
      <ellipse className="login-ship-flame-core" cx="12" cy="24" rx="11" ry="7" fill={`url(#${exhaustId})`} />
      <ellipse className="login-ship-flame-hot" cx="16" cy="24" rx="5.5" ry="3.5" fill="#fef08a" opacity="0.95" />
      {/* Rear nozzle */}
      <path d="M26 16 L26 32 L20 34 L16 24 L20 14 Z" fill="#b91c1c" />
      <path d="M26 18 L26 30 L22 31 L20 24 L22 17 Z" fill="#7f1d1d" opacity="0.6" />
      {/* Body white */}
      <path d="M28 14 L68 10 L88 24 L68 38 L28 34 Z" fill="#f8fafc" />
      {/* Red mid stripe */}
      <path d="M36 15.5 L64 12 L64 36 L36 32.5 Z" fill="#ef4444" opacity="0.92" />
      {/* Nose cone red */}
      <path d="M68 10 L92 24 L68 38 Z" fill="#dc2626" />
      <path d="M72 14 L88 24 L72 34 Z" fill="#f87171" opacity="0.45" />
      {/* Blue window */}
      <circle cx="52" cy="24" r="7.5" fill="#0ea5e9" />
      <circle cx="52" cy="24" r="7.5" fill="none" stroke="#0369a1" strokeWidth="1.5" />
      <ellipse cx="49" cy="21" rx="2.5" ry="2" fill="#e0f2fe" opacity="0.75" />
      {/* Top fin */}
      <path d="M34 14 L28 2 L40 13 Z" fill="#dc2626" />
      <path d="M34 14 L30 6 L38 13.5 Z" fill="#f87171" opacity="0.5" />
      {/* Bottom fin */}
      <path d="M34 34 L28 46 L40 35 Z" fill="#dc2626" />
      <path d="M34 34 L30 42 L38 34.5 Z" fill="#f87171" opacity="0.5" />
      {/* Body highlight */}
      <path d="M30 16 L66 12.5 L66 16 L30 19 Z" fill="#ffffff" opacity="0.35" />
      <defs>
        <radialGradient id={exhaustId} cx="85%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="25%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#f97316" />
          <stop offset="80%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
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

export function SpaceFlybys() {
  const [flybys, setFlybys] = useState<Flyby[]>([]);
  const idRef = useRef(0);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = (20 + Math.random() * 30) * 1000;
      timer = setTimeout(() => {
        if (cancelled) return;
        const id = ++idRef.current;
        const kind: 'ufo' | 'ship' = Math.random() < 0.35 ? 'ufo' : 'ship';
        const duration = 6 + Math.random() * 5;
        const fromLeft = Math.random() < 0.5;
        const top = 12 + Math.random() * 55;
        const chat = Math.random() < 0.65 ? CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)] : null;
        setFlybys((prev) => [...prev, { id, kind, top, duration, fromLeft, chat }]);
        setTimeout(() => setFlybys((prev) => prev.filter((f) => f.id !== id)), duration * 1000 + 200);
        schedule();
      }, wait);
    };
    timer = setTimeout(() => {
      if (cancelled) return;
      const id = ++idRef.current;
      setFlybys([{ id, kind: 'ship', top: 20 + Math.random() * 40, duration: 7, fromLeft: true, chat: 'WOAH COOL' }]);
      setTimeout(() => setFlybys((p) => p.filter((f) => f.id !== id)), 7200);
      schedule();
    }, 8000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);
  return (
    <div className="login-flybys absolute inset-0 pointer-events-none z-[7] overflow-hidden hidden lg:block">
      {flybys.map((f) => (
        <div key={f.id} className={`login-flyby ${f.fromLeft ? 'login-flyby-ltr' : 'login-flyby-rtl'}`} style={{ top: `${f.top}%`, animationDuration: `${f.duration}s` }}>
          {f.chat && <div className="login-flyby-chat">{f.chat}</div>}
          <div className={`login-flyby-craft ${f.kind === 'ship' ? 'login-flyby-ship' : 'login-flyby-ufo'}`}>
            {f.kind === 'ship' && <ShipExhaust />}
            {f.kind === 'ufo' ? <UfoIcon /> : <ShipIcon exhaustId={`rocketFlame-${f.id}`} />}
          </div>
        </div>
      ))}
    </div>
  );
}
