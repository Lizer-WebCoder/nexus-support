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

/** Stars only inside one window zone (0=center, 1=left, 2=right). */
function makeWindowStars(count: number, seed: number, zone: 0 | 1 | 2): Star[] {
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    // Local % inside the zone container (0–100)
    const left = 8 + rnd() * 84;
    const top = 10 + rnd() * 75;
    stars.push({
      left: `${left}%`,
      top: `${top}%`,
      size: 1.2 + rnd() * 2.8,
      delay: rnd() * 5,
      dur: 2.4 + rnd() * 3.2,
      glow: 3 + rnd() * 6,
    });
  }
  return stars;
}

function StarField({
  stars,
  className,
}: {
  stars: Star[];
  className: string;
}) {
  return (
    <div className={className}>
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
            // CSS var for glow strength
            ['--star-glow' as string]: `${st.glow}px`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Day/night lounge crossfade.
 * Stars + nebula only inside the 3 windows (never over the capsule floor).
 * Left/right computer screens have subtle live UI motion.
 */
export default function PortalSpaceLoungeBg() {
  const centerStars = useMemo(() => makeWindowStars(28, 91, 0), []);
  const leftStars = useMemo(() => makeWindowStars(14, 33, 1), []);
  const rightStars = useMemo(() => makeWindowStars(14, 71, 2), []);

  return (
    <div className="portal-lounge" aria-hidden>
      <div
        className="portal-lounge-photo portal-lounge-day"
        style={{ backgroundImage: `url(${LOUNGE_DAY})` }}
      />
      <div
        className="portal-lounge-photo portal-lounge-night"
        style={{ backgroundImage: `url(${LOUNGE_NIGHT})` }}
      />

      {/* Center main window: nebula + stars (clipped) */}
      <div className="portal-lounge-window portal-lounge-window-center">
        <div className="portal-lounge-nebula portal-lounge-nebula-center" />
        <StarField stars={centerStars} className="portal-lounge-stars" />
      </div>

      {/* Left side window above the desk */}
      <div className="portal-lounge-window portal-lounge-window-left">
        <div className="portal-lounge-nebula portal-lounge-nebula-left" />
        <StarField stars={leftStars} className="portal-lounge-stars" />
      </div>

      {/* Right side window */}
      <div className="portal-lounge-window portal-lounge-window-right">
        <div className="portal-lounge-nebula portal-lounge-nebula-right" />
        <StarField stars={rightStars} className="portal-lounge-stars" />
      </div>

      {/* Animated computer screens (left + right) */}
      <div className="portal-lounge-screen portal-lounge-screen-left">
        <span className="portal-lounge-screen-scan" />
        <span className="portal-lounge-screen-pulse" />
        <span className="portal-lounge-screen-data" />
      </div>
      <div className="portal-lounge-screen portal-lounge-screen-right">
        <span className="portal-lounge-screen-scan" />
        <span className="portal-lounge-screen-pulse" />
        <span className="portal-lounge-screen-orbit" />
      </div>

      <div className="portal-lounge-veil" />
    </div>
  );
}
