import { useMemo } from 'react';
import '../portal-lounge.css';
import { LOUNGE_MASTER } from './loungeDay';

function makeStars(count: number) {
  const stars: { left: string; top: string; size: number; delay: number; dur: number }[] = [];
  let s = 42;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: 0.8 + rnd() * 2.0,
      delay: rnd() * 8,
      dur: 3.5 + rnd() * 4,
    });
  }
  return stars;
}

/**
 * One still lounge photo. Light = day look, dark = color-graded night.
 * Framing never moves — only filters change with theme.
 */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(36), []);

  return (
    <div className="portal-lounge" aria-hidden>
      <div
        className="portal-lounge-photo"
        style={{ backgroundImage: `url(${LOUNGE_MASTER})` }}
      />
      <div className="portal-lounge-stars">
        {stars.map((st, i) => (
          <span
            key={i}
            className="portal-lounge-star"
            style={{
              left: st.left,
              top: st.top,
              width: st.size,
              height: st.size,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="portal-lounge-veil" />
    </div>
  );
}
