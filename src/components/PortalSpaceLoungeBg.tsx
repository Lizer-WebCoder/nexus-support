import { useMemo } from 'react';
import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

/** Stable star field for the space window — slow drift + twinkle */
function makeStars(count: number) {
  const stars: { left: string; top: string; size: number; delay: number; dur: number; opacity: number }[] = [];
  // Deterministic PRNG so SSR/client match
  let s = 42;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: 0.8 + rnd() * 2.2,
      delay: rnd() * 8,
      dur: 3 + rnd() * 5,
      opacity: 0.35 + rnd() * 0.55,
    });
  }
  return stars;
}

/**
 * Space lounge for the main content area only.
 * HQ photos (no aggressive crop-zoom) + drifting star field
 * so the window feels alive, not frozen.
 */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(48), []);

  return (
    <div className="portal-lounge" aria-hidden>
      <div
        className="portal-lounge-photo portal-lounge-photo-day"
        style={{ backgroundImage: `url(${LOUNGE_DAY})` }}
      />
      <div
        className="portal-lounge-photo portal-lounge-photo-night"
        style={{ backgroundImage: `url(${LOUNGE_NIGHT})` }}
      />

      {/* Moving galaxy / star layer over the space window */}
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
              opacity: st.opacity,
            }}
          />
        ))}
        <div className="portal-lounge-nebula portal-lounge-nebula-a" />
        <div className="portal-lounge-nebula portal-lounge-nebula-b" />
      </div>

      <div className="portal-lounge-veil" />
    </div>
  );
}
