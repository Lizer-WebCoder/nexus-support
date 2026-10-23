import { useEffect, useRef, useState } from 'react';

const CHAT_LINES = [
  'WOAH COOL', 'NICE TRAIL!', 'Is that Nexus?', 'Sick logo', 'Beep boop', 'Over here!',
  'Support desk?', 'Zoom!', 'Hello agents', 'To the branch!', 'Copy that', 'Need backup?',
  'Tickets flying!', 'SLA green', 'Branch online', 'Portal live', 'Route me in', 'Clear skies',
  'Warp speed', 'Got a ticket?',
];

type Flyby = { id: number; kind: 'ufo' | 'ship'; top: number; duration: number; fromLeft: boolean; chat: string | null };

export function UfoIcon() {
  return (
    <svg width="56" height="28" viewBox="0 0 56 28" fill="none">
      <ellipse cx="28" cy="18" rx="24" ry="7" fill="#94a3b8" opacity="0.9" />
      <ellipse cx="28" cy="16" rx="18" ry="5" fill="#cbd5e1" />
      <ellipse cx="28" cy="12" rx="10" ry="8" fill="#a5b4fc" />
      <ellipse cx="28" cy="10" rx="7" ry="5" fill="#c7d2fe" opacity="0.7" />
      <circle cx="20" cy="18" r="1.5" fill="#f0abfc" />
      <circle cx="28" cy="19" r="1.5" fill="#67e8f9" />
      <circle cx="36" cy="18" r="1.5" fill="#fde68a" />
    </svg>
  );
}

export function ShipIcon({ exhaustId = 'rocketFlame' }: { exhaustId?: string }) {
  return (
    <svg width="88" height="32" viewBox="0 0 88 32" fill="none" aria-hidden className="login-ship-svg">
      <ellipse className="login-ship-flame-core" cx="14" cy="16" rx="12" ry="5.5" fill={`url(#${exhaustId})`} />
      <ellipse className="login-ship-flame-hot" cx="18" cy="16" rx="6" ry="3.2" fill="#fef08a" opacity="0.95" />
      <path d="M22 11 L22 21 L16 23 L12 16 L16 9 Z" fill="#a78bfa" opacity="0.9" />
      <path d="M22 12.5 L22 19.5 L18 20.5 L16 16 L18 11.5 Z" fill="#6d28d9" opacity="0.5" />
      <path d="M24 10 L60 6 L78 16 L60 26 L24 22 Z" fill="#e2e8f0" />
      <path d="M60 6 L78 16 L60 26 Z" fill="#a5b4fc" />
      <path d="M32 10.5 L58 7.5 L58 24.5 L32 21.5 Z" fill="#f8fafc" opacity="0.35" />
      <rect x="36" y="13" width="14" height="6" rx="1.5" fill="#67e8f9" opacity="0.95" />
      <circle cx="70" cy="16" r="2.4" fill="#fde68a" />
      <path d="M30 10 L26 4 L33 10 Z" fill="#94a3b8" />
      <path d="M30 22 L26 28 L33 22 Z" fill="#94a3b8" />
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

export function ShipExhaust() {
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
