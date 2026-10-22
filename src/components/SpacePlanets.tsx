import { useEffect, useRef, useState } from 'react';

type RisingPlanet = {
  id: number;
  kind: 'jupiter' | 'saturn' | 'neptune' | 'mars' | 'earth' | 'venus';
  left: number;
  size: number;
  duration: number;
  drift: number;
  spin: number;
};

const PLANET_KINDS: RisingPlanet['kind'][] = [
  'jupiter',
  'saturn',
  'neptune',
  'mars',
  'earth',
  'venus',
];

/** SVG planet with bands, atmosphere, terminator, optional rings */
function PlanetSvg({ kind, size }: { kind: RisingPlanet['kind']; size: number }) {
  const id = `p-${kind}-${Math.round(size)}`;
  const hasRings = kind === 'saturn' || kind === 'jupiter';

  const fills: Record<RisingPlanet['kind'], { base: string; mid: string; dark: string; accent: string }> = {
    jupiter: { base: '#e8c89a', mid: '#c4843a', dark: '#6b3a12', accent: '#d4a06a' },
    saturn: { base: '#f5e6b8', mid: '#d4b86a', dark: '#8a7040', accent: '#efe0a8' },
    neptune: { base: '#6ec8ff', mid: '#2a6fd4', dark: '#0a2a6a', accent: '#9ad8ff' },
    mars: { base: '#e8a080', mid: '#c44a2a', dark: '#5a1a10', accent: '#f0b898' },
    earth: { base: '#6ec8f0', mid: '#2a8a50', dark: '#0a3040', accent: '#a8e0a0' },
    venus: { base: '#f0d8a0', mid: '#d4a060', dark: '#7a5020', accent: '#ffe8b8' },
  };
  const c = fills[kind];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-sphere`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor={c.accent} />
          <stop offset="45%" stopColor={c.base} />
          <stop offset="78%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
        <radialGradient id={`${id}-atm`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor={c.accent} stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id={`${id}-term`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
        </linearGradient>
        {kind === 'jupiter' && (
          <linearGradient id={`${id}-bands`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c47a30" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#f0d0a0" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#a05020" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#e8c080" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#8b4010" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#d4a060" stopOpacity="0.35" />
          </linearGradient>
        )}
        {kind === 'earth' && (
          <pattern id={`${id}-land`} patternUnits="userSpaceOnUse" width="40" height="40">
            <circle cx="12" cy="14" r="8" fill="#2d8a4a" opacity="0.7" />
            <circle cx="28" cy="28" r="6" fill="#1a6a38" opacity="0.65" />
            <ellipse cx="8" cy="30" rx="7" ry="4" fill="#3a9a55" opacity="0.55" />
          </pattern>
        )}
      </defs>

      {hasRings && kind === 'saturn' && (
        <ellipse
          cx="50"
          cy="52"
          rx="72"
          ry="16"
          fill="none"
          stroke="rgba(240, 220, 160, 0.55)"
          strokeWidth="3.5"
          transform="rotate(-18 50 50)"
        />
      )}
      {hasRings && kind === 'jupiter' && (
        <ellipse
          cx="50"
          cy="52"
          rx="58"
          ry="10"
          fill="none"
          stroke="rgba(200, 170, 120, 0.3)"
          strokeWidth="1.5"
          transform="rotate(-15 50 50)"
        />
      )}

      <circle cx="50" cy="50" r="42" fill={`url(#${id}-sphere)`} />

      {kind === 'jupiter' && (
        <circle cx="50" cy="50" r="42" fill={`url(#${id}-bands)`} className="login-planet-bands" opacity="0.85" />
      )}
      {kind === 'earth' && <circle cx="50" cy="50" r="42" fill={`url(#${id}-land)`} opacity="0.9" />}
      {kind === 'mars' && (
        <>
          <circle cx="38" cy="40" r="6" fill="rgba(90,30,20,0.35)" />
          <circle cx="58" cy="55" r="4" fill="rgba(90,30,20,0.3)" />
          <ellipse cx="45" cy="62" rx="8" ry="3" fill="rgba(200,120,80,0.25)" />
        </>
      )}
      {kind === 'neptune' && (
        <ellipse cx="50" cy="50" rx="38" ry="8" fill="rgba(255,255,255,0.12)" transform="rotate(-8 50 50)" />
      )}

      <circle cx="50" cy="50" r="42" fill={`url(#${id}-term)`} />
      <circle cx="50" cy="50" r="42" fill={`url(#${id}-atm)`} />
      <ellipse cx="36" cy="34" rx="10" ry="7" fill="rgba(255,255,255,0.22)" />

      {hasRings && kind === 'saturn' && (
        <path
          d="M 8 55 Q 50 68 92 55"
          fill="none"
          stroke="rgba(255, 235, 180, 0.5)"
          strokeWidth="2.5"
          transform="rotate(-18 50 50)"
        />
      )}
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
      const base = kind === 'jupiter' || kind === 'saturn' ? 88 : kind === 'neptune' || kind === 'earth' ? 56 : 42;
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
