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
};

function makeStars(count: number, seed: number): Star[] {
  const colors = ['#ffffff', '#c4b5fd', '#f0abfc', '#67e8f9', '#e9d5ff', '#f9a8d4'];
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: 1 + rnd() * 2.2,
      delay: rnd() * 8,
      dur: 2.5 + rnd() * 4,
      color: colors[i % colors.length],
      opacity: 0.35 + rnd() * 0.55,
    });
  }
  return stars;
}

/**
 * Portal background aligned with login cosmic gradient.
 * Animated nebula + stars; light/dark theme variants of the same palette.
 */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(56, 42), []);

  return (
    <div className="portal-cosmic" aria-hidden>
      <div className="portal-cosmic-sky" />
      <div className="portal-cosmic-galaxy" />
      <div className="portal-cosmic-nebula portal-cosmic-nebula-a" />
      <div className="portal-cosmic-nebula portal-cosmic-nebula-b" />
      <div className="portal-cosmic-dust" />
      <div className="portal-cosmic-stars">
        {stars.map((st, i) => (
          <span
            key={i}
            className="portal-cosmic-star"
            style={{
              left: st.left,
              top: st.top,
              width: st.size,
              height: st.size,
              background: st.color,
              opacity: st.opacity,
              boxShadow: `0 0 ${st.size * 3}px ${st.color}`,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="portal-cosmic-veil" />
    </div>
  );
}
