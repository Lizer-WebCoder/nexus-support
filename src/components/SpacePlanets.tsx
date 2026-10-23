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
  'jupiter', 'saturn', 'neptune', 'mars', 'earth', 'venus', 'mercury', 'uranus',
];

/** Cartoon planets matching the reference sheet */
function PlanetSvg({ kind, size }: { kind: PlanetKind; size: number }) {
  const id = `p-${kind}-${Math.round(size)}`;

  if (kind === 'earth') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M22 40 Q30 22 48 28 Q55 38 48 50 Q35 55 24 48 Z" fill="#4ade80" />
        <path d="M52 36 Q70 28 78 42 Q74 58 58 56 Q50 48 52 36 Z" fill="#22c55e" />
        <path d="M30 58 Q44 52 52 64 Q44 78 28 72 Q24 64 30 58 Z" fill="#16a34a" />
        <path d="M60 62 Q70 60 74 70 Q68 78 58 74 Z" fill="#4ade80" />
        <ellipse cx="34" cy="30" rx="10" ry="6" fill="rgba(255,255,255,0.35)" />
        <ellipse cx="58" cy="40" rx="6" ry="3.5" fill="rgba(255,255,255,0.2)" />
      </svg>
    );
  }

  if (kind === 'mars') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="35%" stopColor="#f43f5e" />
            <stop offset="70%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M14 38 Q50 48 86 36" stroke="#9f1239" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M16 54 Q50 64 84 52" stroke="#881337" strokeWidth="4" fill="none" opacity="0.45" strokeLinecap="round" />
        <path d="M18 68 Q50 76 82 66" stroke="#9f1239" strokeWidth="3.5" fill="none" opacity="0.4" strokeLinecap="round" />
        <circle cx="36" cy="34" r="7" fill="#7f1d1d" opacity="0.3" />
        <ellipse cx="32" cy="28" rx="11" ry="7" fill="rgba(255,255,255,0.22)" />
      </svg>
    );
  }

  if (kind === 'jupiter') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="74%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <ellipse cx="50" cy="28" rx="42" ry="6" fill="#fde68a" opacity="0.55" />
        <ellipse cx="50" cy="40" rx="44" ry="5" fill="#b45309" opacity="0.5" />
        <ellipse cx="50" cy="52" rx="44" ry="6" fill="#fcd34d" opacity="0.45" />
        <ellipse cx="50" cy="64" rx="42" ry="5" fill="#92400e" opacity="0.5" />
        <ellipse cx="50" cy="74" rx="38" ry="4" fill="#fde68a" opacity="0.4" />
        <ellipse cx="64" cy="58" rx="12" ry="8" fill="#dc2626" opacity="0.85" />
        <ellipse cx="64" cy="58" rx="8" ry="5" fill="#f87171" opacity="0.55" />
        <ellipse cx="32" cy="30" rx="12" ry="8" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }

  if (kind === 'saturn') {
    return (
      <svg width={size} height={size} viewBox="0 0 130 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#a16207" />
          </radialGradient>
        </defs>
        <ellipse cx="65" cy="52" rx="60" ry="16" fill="none" stroke="#fde68a" strokeWidth="4" opacity="0.55" transform="rotate(-18 65 52)" />
        <ellipse cx="65" cy="52" rx="52" ry="12" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.5" transform="rotate(-18 65 52)" />
        <ellipse cx="65" cy="52" rx="44" ry="9" fill="none" stroke="#fef08a" strokeWidth="2" opacity="0.4" transform="rotate(-18 65 52)" />
        <circle cx="65" cy="50" r="34" fill={`url(#${id}-s)`} />
        <ellipse cx="65" cy="42" rx="30" ry="4" fill="#ca8a04" opacity="0.3" />
        <ellipse cx="65" cy="56" rx="28" ry="3.5" fill="#a16207" opacity="0.25" />
        <ellipse cx="65" cy="52" rx="60" ry="16" fill="none" stroke="#fef9c3" strokeWidth="3" opacity="0.75" transform="rotate(-18 65 52)" strokeDasharray="0 55 90 200" />
        <ellipse cx="52" cy="36" rx="9" ry="6" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  }

  if (kind === 'neptune') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M12 40 Q50 52 88 38" stroke="#1d4ed8" strokeWidth="6" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M14 58 Q50 70 86 56" stroke="#1e40af" strokeWidth="5" fill="none" opacity="0.45" strokeLinecap="round" />
        <ellipse cx="32" cy="30" rx="11" ry="7" fill="rgba(255,255,255,0.28)" />
      </svg>
    );
  }

  if (kind === 'uranus') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="14" ry="52" fill="none" stroke="#67e8f9" strokeWidth="3" opacity="0.6" transform="rotate(12 50 50)" />
        <ellipse cx="50" cy="50" rx="9" ry="46" fill="none" stroke="#a5f3fc" strokeWidth="2" opacity="0.45" transform="rotate(12 50 50)" />
        <circle cx="50" cy="50" r="38" fill={`url(#${id}-s)`} />
        <ellipse cx="40" cy="36" rx="9" ry="6" fill="rgba(255,255,255,0.3)" />
      </svg>
    );
  }

  if (kind === 'venus') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="32%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#e7b56a" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M14 38 Q50 48 86 36" stroke="#a16207" strokeWidth="5" fill="none" opacity="0.4" strokeLinecap="round" />
        <path d="M16 56 Q50 66 84 54" stroke="#92400e" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
        <ellipse cx="32" cy="28" rx="11" ry="7" fill="rgba(255,255,255,0.25)" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-s`} cx="32%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#e7e5e4" />
          <stop offset="40%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#44403c" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
      <circle cx="36" cy="34" r="8" fill="#78716c" opacity="0.5" />
      <circle cx="60" cy="48" r="6" fill="#57534e" opacity="0.45" />
      <circle cx="42" cy="62" r="7" fill="#78716c" opacity="0.4" />
      <circle cx="68" cy="32" r="4.5" fill="#57534e" opacity="0.4" />
      <circle cx="28" cy="54" r="3.5" fill="#78716c" opacity="0.35" />
      <ellipse cx="32" cy="28" rx="10" ry="6" fill="rgba(255,255,255,0.28)" />
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
        kind === 'jupiter' || kind === 'saturn' ? 92 :
        kind === 'neptune' || kind === 'earth' || kind === 'uranus' ? 60 : 46;
      const size = base + Math.random() * (kind === 'jupiter' || kind === 'saturn' ? 36 : 24);
      const duration = 16 + Math.random() * 10;
      const left = 6 + Math.random() * 78;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 50);
      const spin = (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 80);

      setPlanets((prev) => [...prev.slice(-3), { id, kind, left, size, duration, drift, spin }]);
      setTimeout(() => {
        setPlanets((prev) => prev.filter((x) => x.id !== id));
      }, duration * 1000 + 400);

      const gaps = [10, 14, 18, 22, 26, 30, 35];
      timer = setTimeout(spawn, gaps[Math.floor(Math.random() * gaps.length)] * 1000);
    };

    timer = setTimeout(spawn, 4000 + Math.random() * 2500);
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
