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
    '#67e8f9',
    '#f9a8d4',
    '#a5b4fc',
    '#ddd6fe',
  ];
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const bright = i % 11 === 0;
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: bright ? 1.8 + rnd() * 1.8 : 0.6 + rnd() * 1.4,
      delay: rnd() * 10,
      dur: 2 + rnd() * 5,
      color: colors[i % colors.length],
      opacity: 0.3 + rnd() * 0.65,
      glow: bright ? 6 + rnd() * 6 : 2 + rnd() * 3,
    });
  }
  return stars;
}

/** Dense swirling galaxy + starfield. No planets. Light & dark share the same cosmic palette. */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(160, 42), []);
  const dense = useMemo(() => makeStars(90, 99), []);

  return (
    <div className="portal-cosmic" aria-hidden>
      <div className="portal-cosmic-sky" />

      {/* Swirling galaxy core + arms */}
      <div className="portal-galaxy">
        <div className="portal-galaxy-core" />
        <div className="portal-galaxy-arm portal-galaxy-arm-1" />
        <div className="portal-galaxy-arm portal-galaxy-arm-2" />
        <div className="portal-galaxy-arm portal-galaxy-arm-3" />
        <div className="portal-galaxy-glow" />
      </div>

      <div className="portal-cosmic-nebula portal-cosmic-nebula-a" />
      <div className="portal-cosmic-nebula portal-cosmic-nebula-b" />

      {/* Two star layers for density */}
      <div className="portal-cosmic-stars portal-cosmic-stars-a">
        {stars.map((st, i) => (
          <span
            key={`a${i}`}
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
      </div>
      <div className="portal-cosmic-stars portal-cosmic-stars-b">
        {dense.map((st, i) => (
          <span
            key={`b${i}`}
            className="portal-cosmic-star portal-cosmic-star-slow"
            style={{
              left: st.left,
              top: st.top,
              width: Math.max(0.5, st.size * 0.7),
              height: Math.max(0.5, st.size * 0.7),
              background: st.color,
              opacity: st.opacity * 0.75,
              boxShadow: `0 0 ${st.glow * 0.7}px ${st.color}`,
              animationDelay: `${st.delay + 1}s`,
              animationDuration: `${st.dur + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="portal-cosmic-dust" />
      <div className="portal-cosmic-veil" />
    </div>
  );
}
