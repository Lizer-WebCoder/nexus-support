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

function makeWindowStars(count: number, seed: number): Star[] {
  const stars: Star[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      left: `${6 + rnd() * 88}%`,
      top: `${8 + rnd() * 80}%`,
      size: 1.1 + rnd() * 2.6,
      delay: rnd() * 5,
      dur: 2.2 + rnd() * 3.4,
      glow: 2.5 + rnd() * 5,
    });
  }
  return stars;
}

function StarField({ stars }: { stars: Star[] }) {
  return (
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
            ['--star-glow' as string]: `${st.glow}px`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Day/night lounge photos animate themselves (slow drift).
 * Galaxy + stars only inside the three real windows — no extra cards/overlays.
 */
export default function PortalSpaceLoungeBg() {
  const centerStars = useMemo(() => makeWindowStars(32, 91), []);
  const leftStars = useMemo(() => makeWindowStars(12, 33), []);
  const rightStars = useMemo(() => makeWindowStars(12, 71), []);

  return (
    <div className="portal-lounge" aria-hidden>
      {/* Photos slowly drift — the background itself moves */}
      <div className="portal-lounge-photo-wrap">
        <div
          className="portal-lounge-photo portal-lounge-day"
          style={{ backgroundImage: `url(${LOUNGE_DAY})` }}
        />
        <div
          className="portal-lounge-photo portal-lounge-night"
          style={{ backgroundImage: `url(${LOUNGE_NIGHT})` }}
        />
      </div>

      {/* Center window galaxy only */}
      <div className="portal-lounge-window portal-lounge-window-center">
        <div className="portal-lounge-nebula" />
        <StarField stars={centerStars} />
      </div>

      {/* Left window */}
      <div className="portal-lounge-window portal-lounge-window-left">
        <div className="portal-lounge-nebula" />
        <StarField stars={leftStars} />
      </div>

      {/* Right window */}
      <div className="portal-lounge-window portal-lounge-window-right">
        <div className="portal-lounge-nebula" />
        <StarField stars={rightStars} />
      </div>

      <div className="portal-lounge-veil" />
    </div>
  );
}
