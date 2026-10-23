import { useEffect, useRef, useState } from 'react';

type FlybyKind = 'ufo' | 'rocket';

type Flyby = {
  id: number;
  kind: FlybyKind;
  variant: number;
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

/** Teardrop exhaust attached to the nozzle. Origin is the right tip so the flicker grows backward. */
function Flame({ eid, tone }: { eid: string; tone: 'fire' | 'violet' | 'cyan' | 'gold' }) {
  const stops =
    tone === 'violet'
      ? ['#6d28d9', '#c026d3', '#f9a8d4', '#fff']
      : tone === 'cyan'
        ? ['#0369a1', '#22d3ee', '#a5f3fc', '#fff']
        : tone === 'gold'
          ? ['#b45309', '#f59e0b', '#fde68a', '#fff']
          : ['#9a3412', '#f97316', '#fbbf24', '#fff7ed'];
  return (
    <g>
      <defs>
        <linearGradient id={eid} x1="34" y1="18" x2="2" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="35%" stopColor={stops[1]} />
          <stop offset="72%" stopColor={stops[2]} />
          <stop offset="100%" stopColor={stops[3]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="login-ship-flame-core" d="M34 10 C22 2 8 6 1 18 C8 30 22 34 34 26 Z" fill={`url(#${eid})`} />
      <path className="login-ship-flame-mid" d="M34 13 C24 8 14 11 8 18 C14 25 24 28 34 23 Z" fill={stops[2]} opacity="0.9" />
      <path className="login-ship-flame-hot" d="M34 15.2 C27 13 20 14.5 16 18 C20 21.5 27 23 34 20.8 Z" fill="#fff" />
    </g>
  );
}

/** Classic red nose, white body, orange fins, fire from the bell. */
function RocketClassic({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="86" height="40" viewBox="0 0 96 40" fill="none" aria-hidden>
      <Flame eid={eid} tone="fire" />
      <path d="M36 12 L42 20 L36 28 Z" fill="#ea580c" />
      <path d="M38 15 L41 20 L38 25 Z" fill="#fdba74" />
      <path d="M42 11.5 C58 10 72 10 74 20 C72 30 58 30 42 28.5 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
      <path d="M46 13.2 C58 12.2 68 12.4 70 18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <path d="M74 11.5 C90 14 94 20 90 20 C94 20 90 26 74 28.5 Z" fill="#ef4444" />
      <path d="M78 15 C86 17 88 20 86 20 C88 20 86 23 78 25 Z" fill="#fecaca" opacity="0.85" />
      <circle cx="58" cy="20" r="4.2" fill="#0ea5e9" stroke="#0369a1" strokeWidth="1.1" />
      <circle cx="58" cy="20" r="2.4" fill="#7dd3fc" />
      <ellipse cx="56.6" cy="18.6" rx="1.1" ry="0.8" fill="#fff" opacity="0.95" />
      <path d="M46 11.5 L52 4.5 L58 12 Z" fill="#f97316" />
      <path d="M46 28.5 L52 35.5 L58 28 Z" fill="#f97316" />
      <path d="M48 11.8 L52 7 L55 12" stroke="#fdba74" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

/** Chubby violet capsule, pink fins, matching purple exhaust. */
function RocketViolet({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="82" height="40" viewBox="0 0 96 40" fill="none" aria-hidden>
      <Flame eid={eid} tone="violet" />
      <path d="M36 13 L43 20 L36 27 Z" fill="#7e22ce" />
      <path d="M42 12 C60 9 74 11 78 20 C74 29 60 31 42 28 Z" fill="#c4b5fd" />
      <path d="M46 14.5 C58 12.8 68 14 70 18.5" stroke="#ede9fe" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M76 13 C92 16 96 20 92 20 C96 20 92 24 76 27 Z" fill="#7c3aed" />
      <circle cx="60" cy="20" r="4" fill="#22d3ee" stroke="#0891b2" strokeWidth="1" />
      <ellipse cx="58.6" cy="18.7" rx="1.2" ry="0.8" fill="#fff" />
      <path d="M48 12 L54 5 L60 13 Z" fill="#db2777" />
      <path d="M48 28 L54 35 L60 27 Z" fill="#db2777" />
    </svg>
  );
}

/** Round orange shuttle with side pods and a gold-white flame. */
function RocketOrange({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="80" height="42" viewBox="0 0 96 42" fill="none" aria-hidden>
      <g transform="translate(0 1)">
        <Flame eid={eid} tone="gold" />
        <ellipse cx="40" cy="12" rx="5" ry="3.2" fill="#c2410c" />
        <ellipse cx="40" cy="28" rx="5" ry="3.2" fill="#c2410c" />
        <path d="M36 13 L30 20 L36 27 Z" fill="#9a3412" />
        <path d="M42 12 C58 9.5 72 11 76 20 C72 29 58 30.5 42 28 Z" fill="#fb923c" />
        <path d="M48 14.2 C60 12.6 68 13.5 70 17.8" stroke="#ffedd5" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M74 13.5 C90 16.5 94 20 90 20 C94 20 90 23.5 74 26.5 Z" fill="#ea580c" />
        <circle cx="60" cy="20" r="4.1" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
        <ellipse cx="58.5" cy="18.6" rx="1.2" ry="0.85" fill="#fff" />
      </g>
    </svg>
  );
}

/** Teal dart with cyan exhaust. */
function RocketTeal({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="86" height="36" viewBox="0 0 96 36" fill="none" aria-hidden>
      <g transform="translate(0 -2)">
        <Flame eid={eid} tone="cyan" />
        <path d="M36 14 L42 20 L36 26 Z" fill="#0f766e" />
        <path d="M42 13 C62 11 74 12 76 20 C74 28 62 29 42 27 Z" fill="#5eead4" />
        <path d="M48 15 C62 13.6 70 14.4 72 18" stroke="#ccfbf1" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M76 13 C92 16 96 20 92 20 C96 20 92 24 76 27 Z" fill="#0d9488" />
        <circle cx="60" cy="20" r="3.6" fill="#0284c7" stroke="#0c4a6e" strokeWidth="1" />
        <ellipse cx="58.8" cy="18.8" rx="1" ry="0.7" fill="#e0f2fe" />
        <path d="M48 13 L53 6 L58 13.4 Z" fill="#115e59" />
        <path d="M48 27 L53 34 L58 26.6 Z" fill="#115e59" />
      </g>
    </svg>
  );
}

/** White bullet with blue stripe and a tight orange flame. */
function RocketBullet({ eid }: { eid: string }) {
  return (
    <svg className="login-ship-svg" width="84" height="34" viewBox="0 0 96 36" fill="none" aria-hidden>
      <g transform="translate(0 -2)">
        <Flame eid={eid} tone="fire" />
        <path d="M34 16 L40 20 L34 24 Z" fill="#b91c1c" />
        <path d="M40 14.5 C64 13 78 14 80 20 C78 26 64 27 40 25.5 Z" fill="#f1f5f9" />
        <path d="M44 18.2 H72" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M78 15 C92 17 96 20 92 20 C96 20 92 23 78 25 Z" fill="#1d4ed8" />
        <circle cx="58" cy="20" r="3.2" fill="#0ea5e9" />
        <ellipse cx="57" cy="19" rx="1" ry="0.7" fill="#fff" />
      </g>
    </svg>
  );
}

/** Saucer + dome + alien. Beam hangs under the hull — not a rocket plume. */
function UfoClassic({ uid }: { uid: string }) {
  return (
    <svg className="login-ship-svg login-flyby-ufo" width="78" height="58" viewBox="0 0 90 68" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-beam`} x1="45" y1="34" x2="45" y2="66" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-dome`} x1="45" y1="6" x2="45" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="55%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id={`${uid}-hull`} x1="45" y1="24" x2="45" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="45%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>
      <path className="login-ufo-beam" d="M36 34 L28 64 H62 L54 34 Z" fill={`url(#${uid}-beam)`} />
      <ellipse cx="45" cy="36" rx="40" ry="9" fill="#1e293b" />
      <ellipse cx="45" cy="33" rx="38" ry="8" fill={`url(#${uid}-hull)`} />
      <ellipse cx="45" cy="30" rx="28" ry="4.2" fill="#e2e8f0" opacity="0.35" />
      <path d="M24 28 C28 12 62 12 66 28 Z" fill={`url(#${uid}-dome)`} />
      <path d="M32 22 C36 16 48 15 52 20" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="45" cy="22" rx="7" ry="7.2" fill="#4ade80" />
      <ellipse cx="42.2" cy="21" rx="1.7" ry="2.1" fill="#14532d" />
      <ellipse cx="47.8" cy="21" rx="1.7" ry="2.1" fill="#14532d" />
      <circle cx="41.7" cy="20.4" r="0.45" fill="#fff" />
      <circle cx="47.3" cy="20.4" r="0.45" fill="#fff" />
      <path d="M42.4 24.4 Q45 26.2 47.6 24.4" stroke="#14532d" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <circle className="login-ufo-light" cx="16" cy="33" r="2.1" fill="#facc15" />
      <circle className="login-ufo-light login-ufo-light-b" cx="30" cy="36" r="2.1" fill="#f472b6" />
      <circle className="login-ufo-light login-ufo-light-c" cx="60" cy="36" r="2.1" fill="#34d399" />
      <circle className="login-ufo-light" cx="74" cy="33" r="2.1" fill="#60a5fa" />
    </svg>
  );
}

/** Teal saucer with two downward ion jets (reference-style), no rear rocket flame. */
function UfoIon({ uid }: { uid: string }) {
  return (
    <svg className="login-ship-svg login-flyby-ufo" width="76" height="54" viewBox="0 0 90 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-jet`} x1="0" y1="36" x2="0" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-hull`} x1="45" y1="22" x2="45" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#99f6e4" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>
      </defs>
      <path className="login-ufo-beam" d="M24 36 L18 60 H32 L30 36 Z" fill={`url(#${uid}-jet)`} />
      <path className="login-ufo-beam login-ufo-light-b" d="M60 36 L58 60 H72 L66 36 Z" fill={`url(#${uid}-jet)`} />
      <ellipse cx="45" cy="36" rx="36" ry="8" fill="#134e4a" />
      <ellipse cx="45" cy="33" rx="34" ry="7" fill={`url(#${uid}-hull)`} />
      <path d="M30 30 C34 16 56 16 60 30 Z" fill="#67e8f9" />
      <path d="M36 24 C40 19 50 19 54 25" stroke="#ecfeff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <circle cx="45" cy="24" r="2.2" fill="#0f766e" />
      <circle className="login-ufo-light" cx="18" cy="33" r="1.8" fill="#fde68a" />
      <circle className="login-ufo-light login-ufo-light-c" cx="72" cy="33" r="1.8" fill="#fde68a" />
    </svg>
  );
}

const ROCKETS = [RocketClassic, RocketViolet, RocketOrange, RocketTeal, RocketBullet];

export function SpaceFlybys() {
  const [flybys, setFlybys] = useState<Flyby[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      if (cancelled) return;
      const id = ++idRef.current;
      const isUfo = Math.random() < 0.3;
      const kind: FlybyKind = isUfo ? 'ufo' : 'rocket';
      const variant = isUfo ? (Math.random() < 0.55 ? 0 : 1) : Math.floor(Math.random() * ROCKETS.length);
      const top = 10 + Math.random() * 64;
      const duration = 10 + Math.random() * 6;
      const dir: 'ltr' | 'rtl' = Math.random() < 0.5 ? 'ltr' : 'rtl';
      const chat = Math.random() < 0.5 ? CHATS[Math.floor(Math.random() * CHATS.length)] : undefined;

      setFlybys((prev) => [...prev.slice(-4), { id, kind, variant, top, duration, dir, chat }]);
      setTimeout(() => {
        setFlybys((prev) => prev.filter((f) => f.id !== id));
      }, duration * 1000 + 200);

      const gaps = [16, 20, 24, 28, 34, 42];
      timer = setTimeout(schedule, gaps[Math.floor(Math.random() * gaps.length)] * 1000);
    };

    timer = setTimeout(schedule, 5000 + Math.random() * 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="login-flybys absolute inset-0 pointer-events-none z-[4] overflow-hidden" aria-hidden>
      {flybys.map((f) => {
        const Rocket = ROCKETS[f.variant] ?? RocketClassic;
        return (
          <div
            key={f.id}
            className={`login-flyby login-flyby-${f.dir}`}
            style={{ top: `${f.top}%`, animationDuration: `${f.duration}s` }}
          >
            {f.chat && <div className="login-flyby-chat">{f.chat}</div>}
            <div className="login-flyby-craft">
              <div className="login-flyby-ship">
                {f.kind === 'ufo'
                  ? (f.variant === 1 ? <UfoIon uid={`ufo-${f.id}`} /> : <UfoClassic uid={`ufo-${f.id}`} />)
                  : <Rocket eid={`rocketFlame-${f.id}`} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
