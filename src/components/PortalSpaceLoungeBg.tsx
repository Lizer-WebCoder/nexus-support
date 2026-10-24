import { useMemo } from 'react';
import '../portal-lounge.css';
import { LOUNGE_DAY } from './loungeDay';
import { LOUNGE_NIGHT } from './loungeNight';

type Star = {
  left: string;
  top: string;
  size: number;
  delay: number;
  dur: number;
  glow: number;
};

function makeStars(count: number, seed: number, band: 'full' | 'window'): Star[] {
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    let left = rnd() * 100;
    let top = rnd() * 100;
    // Bias stars into the three window zones (upper middle + sides)
    if (band === 'window') {
      const zone = i % 3;
      if (zone === 0) {
        // center main window
        left = 22 + rnd() * 56;
        top = 8 + rnd() * 42;
      } else if (zone === 1) {
        // left side window
        left = 2 + rnd() * 18;
        top = 18 + rnd() * 45;
      } else {
        // right side window
        left = 78 + rnd() * 20;
        top = 18 + rnd() * 45;
      }
    }
    stars.push({
      left: `${left}%`,
      top: `${top}%`,
      size: 1.0 + rnd() * 2.6,
      delay: rnd() * 6,
      dur: 2.8 + rnd() * 3.5,
      glow: 2 + rnd() * 5,
    });
  }
  return stars;
}

/**
 * Day + night lounge photos crossfade with theme.
 * Animated galaxy/stars in the three windows; room light follows theme.
 */
export default function PortalSpaceLoungeBg() {
  const windowStars = useMemo(() => makeStars(48, 91, 'window'), []);
  const ambientStars = useMemo(() => makeStars(18, 17, 'full'), []);

  return (
    <div className="portal-lounge" aria-hidden>
      {/* Day (light) */}
      <div
        className="portal-lounge-photo portal-lounge-day"
        style={{ backgroundImage: `url(${LOUNGE_DAY})` }}
      />
      {/* Night (dark) */}
      <div
        className="portal-lounge-photo portal-lounge-night"
        style={{ backgroundImage: `url(${LOUNGE_NIGHT})` }}
      />

      {/* Soft nebula drift inside the three windows */}
      <div className="portal-lounge-nebula portal-lounge-nebula-center" />
      <div className="portal-lounge-nebula portal-lounge-nebula-left" />
      <div className="portal-lounge-nebula portal-lounge-nebula-right" />

      {/* Moving / glowing stars concentrated in windows */}
      <div className="portal-lounge-stars">
        {windowStars.map((st, i) => (
          <span
            key={`w${i}`}
            className="portal-lounge-star portal-lounge-star-window"
            style={{
              left: st.left,
              top: st.top,
              width: st.size,
              height: st.size,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.dur}s`,
              boxShadow: `0 0 ${st.glow}px ${st.glow * 0.4}px rgba(180, 210, 255, 0.85)`,
            }}
          />
        ))}
        {ambientStars.map((st, i) => (
          <span
            key={`a${i}`}
            className="portal-lounge-star"
            style={{
              left: st.left,
              top: st.top,
              width: st.size * 0.7,
              height: st.size * 0.7,
              animationDelay: `${st.delay}s`,
              animationDuration: `${st.dur + 1}s`,
            }}
          />
        ))}
      </div>

      {/* Room light / atmosphere */}
      <div className="portal-lounge-veil" />
    </div>
  );
}
