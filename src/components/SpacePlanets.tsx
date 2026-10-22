import { useEffect, useRef, useState } from 'react';

type RisingPlanet = {
  id: number;
  kind: 'jupiter' | 'saturn' | 'ice' | 'mars' | 'gas' | 'rocky';
  left: number;
  size: number;
  duration: number;
  drift: number;
  spin: number;
};

const PLANET_KINDS: RisingPlanet['kind'][] = ['jupiter', 'saturn', 'ice', 'mars', 'gas', 'rocky'];

function RisingPlanetView({ p }: { p: RisingPlanet }) {
  const ring = p.kind === 'jupiter' || p.kind === 'saturn';
  const gradients: Record<RisingPlanet['kind'], string> = {
    jupiter: 'radial-gradient(circle at 32% 28%, #f5d0a9 0%, #c47a3a 35%, #8b4513 55%, #3d1f0a 85%)',
    saturn: 'radial-gradient(circle at 38% 30%, #fde68a 0%, #d4a017 40%, #92700a 70%, #3f2e05 95%)',
    ice: 'radial-gradient(circle at 35% 28%, #bae6fd 0%, #38bdf8 40%, #0369a1 75%, #0c4a6e 100%)',
    mars: 'radial-gradient(circle at 40% 30%, #fda4af 0%, #e11d48 45%, #7f1d1d 80%)',
    gas: 'radial-gradient(circle at 30% 25%, #c4b5fd 0%, #7c3aed 40%, #4c1d95 75%, #1e0a3c 100%)',
    rocky: 'radial-gradient(circle at 35% 30%, #a8a29e 0%, #57534e 50%, #1c1917 90%)',
  };
  const ringColor =
    p.kind === 'saturn' ? 'rgba(253, 230, 138, 0.45)' : 'rgba(245, 208, 169, 0.4)';

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
      {ring && (
        <span
          className="login-planet-rise-ring"
          style={{
            borderColor: ringColor,
            width: p.size * 1.85,
            height: p.size * 0.38,
          }}
        />
      )}
      <span
        className="login-planet-rise-body"
        style={{
          width: p.size,
          height: p.size,
          background: gradients[p.kind],
          boxShadow:
            p.kind === 'gas'
              ? 'inset -10px -8px 20px rgba(0,0,0,0.5), 0 0 24px rgba(124,58,237,0.35)'
              : p.kind === 'ice'
                ? 'inset -8px -6px 16px rgba(0,0,0,0.4), 0 0 18px rgba(56,189,248,0.3)'
                : 'inset -10px -8px 22px rgba(0,0,0,0.55)',
        }}
      />
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
      const base = kind === 'jupiter' || kind === 'saturn' ? 70 : kind === 'gas' ? 48 : 32;
      const size = base + Math.random() * (kind === 'jupiter' || kind === 'saturn' ? 50 : 36);
      const duration = 14 + Math.random() * 12;
      const left = 8 + Math.random() * 75;
      const drift = (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 60);
      const spin = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 140);

      setPlanets((prev) => [...prev.slice(-4), { id, kind, left, size, duration, drift, spin }]);
      setTimeout(() => {
        setPlanets((prev) => prev.filter((x) => x.id !== id));
      }, duration * 1000 + 300);

      const gaps = [10, 12, 15, 18, 20, 22, 25, 28, 30, 35];
      const wait = gaps[Math.floor(Math.random() * gaps.length)] * 1000;
      timer = setTimeout(spawn, wait);
    };

    timer = setTimeout(spawn, 4000 + Math.random() * 4000);

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
