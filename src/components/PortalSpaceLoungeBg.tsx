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

type Drift = {
  left: string;
  top: string;
  size: number;
  delay: number;
  dur: number;
  dx: string;
  dy: string;
  color: string;
};

function makeStars(count: number, seed: number): Star[] {
  const colors = [
    '#ffffff',
    '#e9d5ff',
    '#c4b5fd',
    '#f0abfc',
    '#a5f3fc',
    '#67e8f9',
    '#ddd6fe',
  ];
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const bright = i % 10 === 0;
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: bright ? 1.5 + rnd() * 1.8 : 0.5 + rnd() * 1.2,
      delay: rnd() * 10,
      dur: 2 + rnd() * 4.5,
      color: colors[i % colors.length],
      opacity: 0.35 + rnd() * 0.6,
      glow: bright ? 5 + rnd() * 6 : 2 + rnd() * 3,
    });
  }
  return stars;
}

function makeDrift(count: number, seed: number): Drift[] {
  const colors = ['#ffffff', '#e9d5ff', '#c4b5fd', '#67e8f9', '#a5f3fc'];
  const out: Drift[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const angle = rnd() * Math.PI * 2;
    const dist = 30 + rnd() * 80;
    out.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: 0.8 + rnd() * 1.6,
      delay: rnd() * 20,
      dur: 18 + rnd() * 25,
      dx: `${Math.cos(angle) * dist}px`,
      dy: `${Math.sin(angle) * dist}px`,
      color: colors[i % colors.length],
    });
  }
  return out;
}

/** Purple sky + login-style cyan shooting comets + drift particles. */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(160, 42), []);
  const drifts = useMemo(() => makeDrift(40, 91), []);

  return (
    <div className="portal-cosmic" aria-hidden>
      <div className="portal-cosmic-sky" />

      <div className="portal-nebula-wash portal-nebula-wash-a" />
      <div className="portal-nebula-wash portal-nebula-wash-b" />
      <div className="portal-nebula-wash portal-nebula-wash-c" />

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
      </div>

      <div className="portal-drift-layer">
        {drifts.map((d, i) => (
          <span
            key={`d${i}`}
            className="portal-drift-particle"
            style={{
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              background: d.color,
              boxShadow: `0 0 ${d.size * 3}px ${d.color}`,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.dur}s`,
              ['--dx' as string]: d.dx,
              ['--dy' as string]: d.dy,
            }}
          />
        ))}
      </div>

      {/* Login-style cyan comet shooting stars */}
      <div className="portal-shooting-layer">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`portal-shooting-star portal-shooting-${i + 1}`}>
            <span className="portal-comet-trail portal-comet-trail-a" />
            <span className="portal-comet-trail portal-comet-trail-b" />
            <span className="portal-comet-trail portal-comet-trail-c" />
            <span className="portal-comet-head" />
            <span className="portal-comet-particle portal-comet-p1" />
            <span className="portal-comet-particle portal-comet-p2" />
            <span className="portal-comet-particle portal-comet-p3" />
          </div>
        ))}
      </div>

      <div className="portal-cosmic-veil" />
    </div>
  );
}
