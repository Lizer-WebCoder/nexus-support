import { useMemo } from 'react';
import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

/** Fixed star field (opacity twinkle only — no position drift) */
function makeStars(count: number) {
  const stars: { left: string; top: string; size: number; delay: number; dur: number; opacity: number }[] = [];
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
      opacity: 0.35 + rnd() * 0.5,
    });
  }
  return stars;
}

/**
 * Lounge bg for the main content area only.
 * Day/night share identical framing — theme switch fades color only;
 * the scene stays still (no pan/zoom drift).
 */
export default function PortalSpaceLoungeBg() {
  const stars = useMemo(() => makeStars(40), []);

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
              ['--star-base' as string]: st.opacity,
            }}
          />
        ))}
      </div>

      <div className="portal-lounge-veil" />
    </div>
  );
}
