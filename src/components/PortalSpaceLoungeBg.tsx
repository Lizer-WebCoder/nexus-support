import { useMemo } from 'react';
import '../portal-lounge.css';

type Star = {
  left: string;
  top: string;
  size: number;
  delay: number;
  dur: number;
  color: string;
  opacity: number;
  glow: number;
};

function makeStars(count: number, seed: number): Star[] {
  const colors = [
    '#ffffff',
    '#e9d5ff',
    '#c4b5fd',
    '#f0abfc',
    '#ddd6fe',
    '#a5b4fc',
    '#f5d0fe',
    '#e0e7ff',
  ];
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const bright = i % 9 === 0;
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: bright ? 1.6 + rnd() * 2 : 0.55 + rnd() * 1.3,
      delay: rnd() * 12,
      dur: 2.2 + rnd() * 4.5,
      color: colors[i % colors.length],
      opacity: 0.35 + rnd() * 0.6,
      glow: bright ? 5 + rnd() * 7 : 2 + rnd() * 3,
    });
  }
  return stars;
}

/**
 * Purple galaxy sky.
 * Light: soft clouds + many glowing stars.
 * Dark: same scene, darker — black storm clouds + lightning.
 */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(180, 42), []);
  const midStars = useMemo(() => makeStars(80, 77), []);

  return (
    <div className="portal-cosmic" aria-hidden>
      <div className="portal-cosmic-sky" />

      {/* Galaxy swirl */}
      <div className="portal-galaxy">
        <div className="portal-galaxy-core" />
        <div className="portal-galaxy-arm portal-galaxy-arm-1" />
        <div className="portal-galaxy-arm portal-galaxy-arm-2" />
        <div className="portal-galaxy-arm portal-galaxy-arm-3" />
      </div>

      {/* Soft nebula wash */}
      <div className="portal-cosmic-nebula portal-cosmic-nebula-a" />
      <div className="portal-cosmic-nebula portal-cosmic-nebula-b" />

      {/* Clouds — soft in light, black storm in dark */}
      <div className="portal-clouds">
        <div className="portal-cloud portal-cloud-1" />
        <div className="portal-cloud portal-cloud-2" />
        <div className="portal-cloud portal-cloud-3" />
        <div className="portal-cloud portal-cloud-4" />
        <div className="portal-cloud portal-cloud-5" />
      </div>

      {/* Lightning (dark mode only via CSS) */}
      <div className="portal-lightning portal-lightning-a" />
      <div className="portal-lightning portal-lightning-b" />
      <div className="portal-lightning portal-lightning-c" />

      {/* Dense stars */}
      <div className="portal-cosmic-stars">
        {stars.map((st, i) => (
          <span
            key={`s${i}`}
            className="portal-cosmic-star"
            style={{
              left: st.left,
              top: st.top,
              width: st.size,
              height: st.size,
              background: st.color,
              opacity: st.opacity,
              boxShadow: `0 0 ${st.glow}px ${st.color}`,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.dur}s`,
            }}
          />
        ))}
        {midStars.map((st, i) => (
          <span
            key={`m${i}`}
            className="portal-cosmic-star portal-cosmic-star-mid"
            style={{
              left: st.left,
              top: st.top,
              width: Math.max(0.5, st.size * 0.75),
              height: Math.max(0.5, st.size * 0.75),
              background: st.color,
              opacity: st.opacity * 0.8,
              boxShadow: `0 0 ${st.glow * 0.8}px ${st.color}`,
              animationDelay: `${st.delay + 0.5}s`,
              animationDuration: `${st.dur + 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="portal-cosmic-dust" />
      <div className="portal-cosmic-veil" />
    </div>
  );
}
