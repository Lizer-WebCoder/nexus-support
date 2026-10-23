import { useEffect, useRef, useState } from 'react';

type PlanetKind = 'jupiter' | 'saturn' | 'neptune' | 'mars' | 'earth' | 'venus' | 'mercury' | 'uranus';

type RisingPlanet = {
  id: number;
  kind: PlanetKind;
  left: number;
  size: number;
  duration: number;
  drift: number;
  spin: number;
};

const PLANET_KINDS: PlanetKind[] = [
  'jupiter',
  'saturn',
  'neptune',
  'mars',
  'earth',
  'venus',
  'mercury',
  'uranus',
];

/** Cartoon planets matching the reference sheet style */
function PlanetSvg({ kind, size }: { kind: PlanetKind; size: number }) {
  const id = `p-${kind}-${Math.round(size)}`;

  if (kind === 'earth') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="55%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
        <path d="M28 38 Q36 28 48 32 Q52 40 44 48 Q34 50 28 42 Z" fill="#22c55e" />
        <path d="M55 42 Q68 36 74 48 Q70 58 58 56 Q52 50 55 42 Z" fill="#16a34a" />
        <path d="M32 58 Q42 54 48 62 Q40 72 30 68 Q28 62 32 58 Z" fill="#22c55e" />
        <ellipse cx="36" cy="34" rx="8" ry="5" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  }

  if (kind === 'mars') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
        <path d="M18 40 Q50 48 82 38" stroke="#9f1239" strokeWidth="4" fill="none" opacity="0.45" />
        <path d="M20 55 Q50 62 80 52" stroke="#be123c" strokeWidth="3.5" fill="none" opacity="0.4" />
        <path d="M22 68 Q50 74 78 66" stroke="#9f1239" strokeWidth="3" fill="none" opacity="0.35" />
        <circle cx="38" cy="36" r="5" fill="#7f1d1d" opacity="0.35" />
        <ellipse cx="34" cy="32" rx="9" ry="6" fill="rgba(255,255,255,0.2)" />
      </svg>
    );
  }

  if (kind === 'jupiter') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          <linearGradient id={`${id}-bands`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.55" />
            <stop offset="18%" stopColor="#b45309" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#fde68a" stopOpacity="0.4" />
            <stop offset="52%" stopColor="#c2410c" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#fcd34d" stopOpacity="0.4" />
            <stop offset="88%" stopColor="#9a3412" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-bands)`} />
        <ellipse cx="62" cy="58" rx="10" ry="7" fill="#dc2626" opacity="0.75" />
        <ellipse cx="62" cy="58" rx="7" ry="4.5" fill="#f87171" opacity="0.5" />
        <ellipse cx="34" cy="32" rx="10" ry="7" fill="rgba(255,255,255,0.22)" />
      </svg>
    );
  }

  if (kind === 'saturn') {
    return (
      <svg width={size} height={size} viewBox="0 0 120 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>
        </defs>
        <ellipse cx="60" cy="52" rx="56" ry="14" fill="none" stroke="#fde68a" strokeWidth="3.5" opacity="0.55" transform="rotate(-18 60 52)" />
        <ellipse cx="60" cy="52" rx="48" ry="11" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.45" transform="rotate(-18 60 52)" />
        <circle cx="60" cy="50" r="32" fill={`url(#${id}-sphere)`} />
        <path d="M32 42 Q60 46 88 42" stroke="#ca8a04" strokeWidth="2.5" opacity="0.35" fill="none" />
        <path d="M30 55 Q60 60 90 55" stroke="#a16207" strokeWidth="2" opacity="0.3" fill="none" />
        <ellipse cx="60" cy="52" rx="56" ry="14" fill="none" stroke="#fef9c3" strokeWidth="2" opacity="0.7" transform="rotate(-18 60 52)" strokeDasharray="0 40 80 200" />
        <ellipse cx="48" cy="38" rx="8" ry="5" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }

  if (kind === 'neptune') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
        <path d="M18 42 Q50 52 82 40" stroke="#1d4ed8" strokeWidth="5" fill="none" opacity="0.45" />
        <path d="M20 58 Q50 68 80 56" stroke="#1e40af" strokeWidth="4" fill="none" opacity="0.4" />
        <ellipse cx="34" cy="32" rx="9" ry="6" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }

  if (kind === 'uranus') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="12" ry="48" fill="none" stroke="#67e8f9" strokeWidth="2.5" opacity="0.55" transform="rotate(15 50 50)" />
        <ellipse cx="50" cy="50" rx="8" ry="42" fill="none" stroke="#a5f3fc" strokeWidth="1.5" opacity="0.4" transform="rotate(15 50 50)" />
        <circle cx="50" cy="50" r="36" fill={`url(#${id}-sphere)`} />
        <ellipse cx="40" cy="38" rx="8" ry="5" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  }

  if (kind === 'venus') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor="#e7b56a" />
            <stop offset="75%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
        <path d="M20 40 Q50 48 80 38" stroke="#a16207" strokeWidth="4" fill="none" opacity="0.35" />
        <path d="M22 58 Q50 66 78 56" stroke="#92400e" strokeWidth="3.5" fill="none" opacity="0.3" />
        <ellipse cx="34" cy="32" rx="9" ry="6" fill="rgba(255,255,255,0.22)" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="45%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#57534e" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="44" fill={`url(#${id}-sphere)`} />
      <circle cx="38" cy="36" r="6" fill="#78716c" opacity="0.45" />
      <circle cx="58" cy="48" r="4.5" fill="#78716c" opacity="0.4" />
      <circle cx="44" cy="62" r="5" fill="#57534e" opacity="0.4" />
      <circle cx="64" cy="34" r="3.5" fill="#78716c" opacity="0.35" />
      <ellipse cx="34" cy="30" rx="8" ry="5" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

function RisingPlanetView({ p }: { p: RisingPlanet }) {
  return (
    <div
      className="login-planet-rise"
      style={{
        left: `${p.left}%`,
        width: p.size,
        height: p.size,
        animationDuration: `${p.duration}s`,
        ['--planet-drift' as string]: `${p.drift}px`,
        ['--planet-spin' as string]: `${p.spin}deg`,
      }}
    >
      <PlanetSvg kind={p.kind} size={p.size} />
    </div>
  );
}

export default function SpacePlanets() {
  const [planets, setPlanets] = useState<RisingPlanet[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const spawn = () => {
      if (cancelled) return;
      const id = ++idRef.current;
      const kind = PLANET_KINDS[Math.floor(Math.random() * PLANET_KINDS.length)];
      const base =
        kind === 'jupiter' || kind === 'saturn' ? 88 :
        kind === 'neptune' || kind === 'earth' || kind === 'uranus' ? 56 : 42;
      const size = base + Math.random() * (kind === 'jupiter' || kind === 'saturn' ? 40 : 28);
      const duration = 16 + Math.random() * 10;
      const left = 6 + Math.random() * 78;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 50);
      const spin = (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 80);

      setPlanets((prev) => [...prev.slice(-3), { id, kind, left, size, duration, drift, spin }]);
      setTimeout(() => {
        setPlanets((prev) => prev.filter((x) => x.id !== id));
      }, duration * 1000 + 400);

      const gaps = [12, 15, 18, 20, 25, 28, 30, 35];
      timer = setTimeout(spawn, gaps[Math.floor(Math.random() * gaps.length)] * 1000);
    };

    timer = setTimeout(spawn, 5000 + Math.random() * 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="login-planets-rise absolute inset-0 pointer-events-none z-[2] overflow-hidden" aria-hidden>
      {planets.map((p) => (
        <RisingPlanetView key={p.id} p={p} />
      ))}
    </div>
  );
}
