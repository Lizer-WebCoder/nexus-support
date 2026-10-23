import { useEffect, useRef, useState } from 'react';

/** Glossy game-style planet variants matching the colorful reference sheet */
type PlanetKind =
  | 'plasma' | 'ember' | 'toxic' | 'ice' | 'gold' | 'forest' | 'void' | 'crystal'
  | 'neon' | 'coral' | 'azure' | 'lava' | 'mint' | 'orchid' | 'solar' | 'obsidian';

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
  'plasma', 'ember', 'toxic', 'ice', 'gold', 'forest', 'void', 'crystal',
  'neon', 'coral', 'azure', 'lava', 'mint', 'orchid', 'solar', 'obsidian',
];

const PALETTES: Record<PlanetKind, { a: string; b: string; c: string; d: string; glow: string; pattern: 'bands' | 'spots' | 'swirl' | 'rings' | 'cracks' | 'glow' }> = {
  plasma:   { a: '#e9d5ff', b: '#a855f7', c: '#6b21a8', d: '#3b0764', glow: '#c084fc', pattern: 'swirl' },
  ember:    { a: '#fed7aa', b: '#f97316', c: '#c2410c', d: '#7c2d12', glow: '#fb923c', pattern: 'cracks' },
  toxic:    { a: '#bbf7d0', b: '#22c55e', c: '#15803d', d: '#14532d', glow: '#4ade80', pattern: 'spots' },
  ice:      { a: '#e0f2fe', b: '#38bdf8', c: '#0284c7', d: '#0c4a6e', glow: '#7dd3fc', pattern: 'glow' },
  gold:     { a: '#fef08a', b: '#eab308', c: '#a16207', d: '#713f12', glow: '#fde047', pattern: 'bands' },
  forest:   { a: '#86efac', b: '#16a34a', c: '#166534', d: '#052e16', glow: '#4ade80', pattern: 'spots' },
  void:     { a: '#e9d5ff', b: '#7c3aed', c: '#4c1d95', d: '#1e1b4b', glow: '#a78bfa', pattern: 'rings' },
  crystal:  { a: '#cffafe', b: '#22d3ee', c: '#0e7490', d: '#164e63', glow: '#67e8f9', pattern: 'glow' },
  neon:     { a: '#fce7f3', b: '#ec4899', c: '#be185d', d: '#831843', glow: '#f472b6', pattern: 'swirl' },
  coral:    { a: '#fecdd3', b: '#f43f5e', c: '#be123c', d: '#881337', glow: '#fb7185', pattern: 'spots' },
  azure:    { a: '#bfdbfe', b: '#3b82f6', c: '#1d4ed8', d: '#1e3a8a', glow: '#60a5fa', pattern: 'bands' },
  lava:     { a: '#fecaca', b: '#ef4444', c: '#b91c1c', d: '#7f1d1d', glow: '#f87171', pattern: 'cracks' },
  mint:     { a: '#a7f3d0', b: '#34d399', c: '#059669', d: '#064e3b', glow: '#6ee7b7', pattern: 'glow' },
  orchid:   { a: '#e9d5ff', b: '#c026d3', c: '#86198f', d: '#4a044e', glow: '#e879f9', pattern: 'rings' },
  solar:    { a: '#ffedd5', b: '#f59e0b', c: '#d97706', d: '#92400e', glow: '#fbbf24', pattern: 'bands' },
  obsidian: { a: '#c7d2fe', b: '#6366f1', c: '#3730a3', d: '#1e1b4b', glow: '#818cf8', pattern: 'swirl' },
};

function PlanetSvg({ kind, size }: { kind: PlanetKind; size: number }) {
  const id = `gp-${kind}-${Math.round(size)}`;
  const p = PALETTES[kind];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="login-planet-svg" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${id}-s`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor={p.a} />
          <stop offset="35%" stopColor={p.b} />
          <stop offset="72%" stopColor={p.c} />
          <stop offset="100%" stopColor={p.d} />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0.55" />
        </radialGradient>
        <radialGradient id={`${id}-spec`} cx="30%" cy="25%" r="40%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {p.pattern === 'bands' && (
          <linearGradient id={`${id}-pat`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={p.a} stopOpacity="0.35" />
            <stop offset="20%" stopColor={p.d} stopOpacity="0.4" />
            <stop offset="40%" stopColor={p.a} stopOpacity="0.3" />
            <stop offset="60%" stopColor={p.d} stopOpacity="0.45" />
            <stop offset="80%" stopColor={p.a} stopOpacity="0.25" />
            <stop offset="100%" stopColor={p.d} stopOpacity="0.35" />
          </linearGradient>
        )}
      </defs>

      <circle cx="50" cy="50" r="48" fill={`url(#${id}-glow)`} />
      <circle cx="50" cy="50" r="42" fill={`url(#${id}-s)`} />

      {p.pattern === 'bands' && (
        <circle cx="50" cy="50" r="42" fill={`url(#${id}-pat)`} />
      )}
      {p.pattern === 'spots' && (
        <>
          <circle cx="34" cy="36" r="7" fill={p.d} opacity="0.35" />
          <circle cx="60" cy="48" r="5.5" fill={p.d} opacity="0.3" />
          <circle cx="42" cy="62" r="6" fill={p.c} opacity="0.35" />
          <circle cx="68" cy="32" r="4" fill={p.d} opacity="0.28" />
          <circle cx="28" cy="54" r="3.5" fill={p.c} opacity="0.3" />
        </>
      )}
      {p.pattern === 'swirl' && (
        <>
          <path d="M18 40 Q50 28 82 42 Q50 56 18 40" fill={p.a} opacity="0.25" />
          <path d="M22 58 Q50 48 78 60 Q50 70 22 58" fill={p.d} opacity="0.3" />
        </>
      )}
      {p.pattern === 'rings' && (
        <>
          <ellipse cx="50" cy="50" rx="48" ry="12" fill="none" stroke={p.a} strokeWidth="2.5" opacity="0.45" transform="rotate(-20 50 50)" />
          <ellipse cx="50" cy="50" rx="42" ry="9" fill="none" stroke={p.glow} strokeWidth="1.5" opacity="0.35" transform="rotate(-20 50 50)" />
        </>
      )}
      {p.pattern === 'cracks' && (
        <>
          <path d="M30 28 L42 48 L28 58" stroke={p.a} strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M55 30 L62 50 L72 42" stroke={p.a} strokeWidth="1.8" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d="M40 65 L55 72 L48 82" stroke={p.glow} strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round" />
        </>
      )}
      {p.pattern === 'glow' && (
        <>
          <circle cx="50" cy="50" r="28" fill={p.a} opacity="0.12" />
          <circle cx="50" cy="50" r="16" fill={p.a} opacity="0.15" />
        </>
      )}

      <ellipse cx="36" cy="32" rx="14" ry="10" fill={`url(#${id}-spec)`} />
      <circle cx="50" cy="50" r="42" fill="none" stroke={p.glow} strokeWidth="1.2" opacity="0.35" />
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
      const size = 36 + Math.random() * 28;
      const duration = 16 + Math.random() * 10;
      const left = 6 + Math.random() * 78;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 50);
      const spin = (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 100);

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
