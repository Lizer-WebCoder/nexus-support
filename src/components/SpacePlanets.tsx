import { useEffect, useRef, useState } from 'react';

type PlanetKind =
  | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'neptune' | 'venus' | 'mercury' | 'ice';

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
  'earth', 'mars', 'jupiter', 'saturn', 'neptune', 'venus', 'mercury', 'ice',
];

/** Recognizable cartoon planets — continents, bands, craters, rings (not candy balls) */
function PlanetSvg({ kind, size }: { kind: PlanetKind; size: number }) {
  const id = `pl-${kind}-${Math.round(size)}`;

  if (kind === 'earth') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>
          <radialGradient id={`${id}-atm`} cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="transparent" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.35" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M18 42 Q28 24 46 30 Q54 40 46 52 Q32 58 20 50 Z" fill="#22c55e" />
        <path d="M52 34 Q68 26 78 40 Q74 56 58 54 Q50 46 52 34 Z" fill="#16a34a" />
        <path d="M28 58 Q42 52 50 64 Q42 78 26 72 Q22 64 28 58 Z" fill="#4ade80" />
        <path d="M60 62 Q72 58 76 70 Q70 78 58 74 Z" fill="#15803d" />
        <ellipse cx="36" cy="36" rx="10" ry="4" fill="#fff" opacity="0.28" />
        <ellipse cx="62" cy="48" rx="8" ry="3" fill="#fff" opacity="0.2" />
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-atm)`} />
        <ellipse cx="34" cy="30" rx="9" ry="6" fill="#fff" opacity="0.22" />
      </svg>
    );
  }

  if (kind === 'mars') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="35%" stopColor="#e11d48" />
            <stop offset="70%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M14 40 Q50 50 86 38" stroke="#7f1d1d" strokeWidth="4" fill="none" opacity="0.55" strokeLinecap="round" />
        <path d="M16 56 Q50 66 84 54" stroke="#881337" strokeWidth="3.5" fill="none" opacity="0.45" strokeLinecap="round" />
        <circle cx="34" cy="34" r="7" fill="#7f1d1d" opacity="0.4" />
        <circle cx="34" cy="34" r="4" fill="#4c0519" opacity="0.35" />
        <circle cx="64" cy="52" r="5" fill="#7f1d1d" opacity="0.35" />
        <circle cx="48" cy="68" r="4" fill="#9f1239" opacity="0.3" />
        <ellipse cx="32" cy="28" rx="10" ry="6" fill="#fff" opacity="0.15" />
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
        <ellipse cx="50" cy="26" rx="40" ry="5" fill="#fde68a" opacity="0.55" />
        <ellipse cx="50" cy="36" rx="43" ry="4.5" fill="#b45309" opacity="0.5" />
        <ellipse cx="50" cy="46" rx="44" ry="5" fill="#fcd34d" opacity="0.4" />
        <ellipse cx="50" cy="56" rx="43" ry="4.5" fill="#92400e" opacity="0.5" />
        <ellipse cx="50" cy="66" rx="40" ry="4" fill="#fde68a" opacity="0.4" />
        <ellipse cx="50" cy="74" rx="36" ry="3.5" fill="#a16207" opacity="0.4" />
        <ellipse cx="64" cy="58" rx="11" ry="7.5" fill="#dc2626" opacity="0.85" />
        <ellipse cx="64" cy="58" rx="7" ry="4.5" fill="#f87171" opacity="0.5" />
        <ellipse cx="32" cy="30" rx="11" ry="7" fill="#fff" opacity="0.2" />
      </svg>
    );
  }

  if (kind === 'saturn') {
    return (
      <svg width={size} height={size} viewBox="0 0 140 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>
        </defs>
        <ellipse cx="70" cy="52" rx="64" ry="16" fill="none" stroke="#fde68a" strokeWidth="3.5" opacity="0.5" transform="rotate(-18 70 52)" />
        <ellipse cx="70" cy="52" rx="56" ry="12" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.45" transform="rotate(-18 70 52)" />
        <ellipse cx="70" cy="52" rx="48" ry="9" fill="none" stroke="#fef08a" strokeWidth="1.8" opacity="0.35" transform="rotate(-18 70 52)" />
        <circle cx="70" cy="50" r="32" fill={`url(#${id}-s)`} />
        <ellipse cx="70" cy="42" rx="28" ry="3.5" fill="#a16207" opacity="0.3" />
        <ellipse cx="70" cy="56" rx="26" ry="3" fill="#854d0e" opacity="0.25" />
        <ellipse cx="70" cy="52" rx="64" ry="16" fill="none" stroke="#fef9c3" strokeWidth="2.5" opacity="0.7" transform="rotate(-18 70 52)" strokeDasharray="0 58 95 220" />
        <ellipse cx="58" cy="38" rx="8" ry="5" fill="#fff" opacity="0.22" />
      </svg>
    );
  }

  if (kind === 'neptune') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="40%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M12 38 Q50 50 88 36" stroke="#1d4ed8" strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M14 56 Q50 68 86 54" stroke="#1e40af" strokeWidth="4" fill="none" opacity="0.45" strokeLinecap="round" />
        <ellipse cx="62" cy="48" rx="8" ry="5" fill="#1e3a8a" opacity="0.4" />
        <ellipse cx="32" cy="30" rx="10" ry="6" fill="#fff" opacity="0.22" />
      </svg>
    );
  }

  if (kind === 'venus') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="35%" stopColor="#e7b56a" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <path d="M12 36 Q50 46 88 34" stroke="#fef3c7" strokeWidth="6" fill="none" opacity="0.35" strokeLinecap="round" />
        <path d="M14 52 Q50 62 86 50" stroke="#fde68a" strokeWidth="5" fill="none" opacity="0.3" strokeLinecap="round" />
        <path d="M16 66 Q50 74 84 64" stroke="#fef3c7" strokeWidth="4" fill="none" opacity="0.25" strokeLinecap="round" />
        <ellipse cx="32" cy="28" rx="10" ry="6" fill="#fff" opacity="0.2" />
      </svg>
    );
  }

  if (kind === 'mercury') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#e7e5e4" />
            <stop offset="40%" stopColor="#a8a29e" />
            <stop offset="100%" stopColor="#44403c" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
        <circle cx="34" cy="34" r="9" fill="#57534e" opacity="0.45" />
        <circle cx="34" cy="34" r="5" fill="#292524" opacity="0.3" />
        <circle cx="62" cy="48" r="7" fill="#57534e" opacity="0.4" />
        <circle cx="62" cy="48" r="3.5" fill="#292524" opacity="0.25" />
        <circle cx="44" cy="66" r="6" fill="#78716c" opacity="0.4" />
        <circle cx="70" cy="30" r="4.5" fill="#57534e" opacity="0.35" />
        <circle cx="26" cy="56" r="4" fill="#78716c" opacity="0.3" />
        <ellipse cx="32" cy="28" rx="9" ry="5" fill="#fff" opacity="0.18" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-s`} cx="30%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
      <path d="M28 30 L42 48 L30 58" stroke="#e0f2fe" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M55 28 L64 50 L74 40" stroke="#bae6fd" strokeWidth="1.8" fill="none" opacity="0.45" strokeLinecap="round" />
      <path d="M38 64 L52 72 L46 82" stroke="#e0f2fe" strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round" />
      <ellipse cx="36" cy="40" rx="8" ry="5" fill="#fff" opacity="0.25" />
      <ellipse cx="60" cy="58" rx="6" ry="4" fill="#fff" opacity="0.2" />
      <ellipse cx="32" cy="28" rx="10" ry="6" fill="#fff" opacity="0.25" />
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
      const base = kind === 'saturn' || kind === 'jupiter' ? 70 : 52;
      const size = base + Math.random() * 24;
      const duration = 16 + Math.random() * 10;
      const left = 6 + Math.random() * 78;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 50);
      const spin = (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 90);

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
