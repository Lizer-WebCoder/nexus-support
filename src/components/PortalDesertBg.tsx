import { useMemo } from 'react';
import PassingDino from './PassingDino';

/**
 * Reference desert artwork as full-bleed base (night/day),
 * with refined cloud + shooting-star overlays.
 */
export default function PortalDesertBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 7) % 100}%`,
        top: `${(i * 27 + 4) % 48}%`,
        size: i % 9 === 0 ? 2.8 : i % 4 === 0 ? 1.8 : 1.2,
        delay: `${(i * 0.33) % 4.5}s`,
        duration: `${2 + (i % 5) * 0.5}s`,
        bright: i % 6 === 0,
      })),
    [],
  );

  return (
    <div className="portal-desert portal-desert-photo" aria-hidden>
      {/* Reference art — exact scene for mountains, dunes, cacti, moon */}
      <div className="portal-desert-photo-night" />
      <div className="portal-desert-photo-day" />

      {/* Extra twinkles on top of the art */}
      <div className="portal-desert-stars">
        {stars.map((s) => (
          <span
            key={s.id}
            className={`portal-desert-star${s.bright ? ' portal-desert-star-bright' : ''}`}
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* Improved shooting stars */}
      <div className="portal-desert-meteors">
        <span className="portal-meteor portal-meteor-a">
          <span className="portal-meteor-tail" />
          <span className="portal-meteor-head" />
        </span>
        <span className="portal-meteor portal-meteor-b">
          <span className="portal-meteor-tail" />
          <span className="portal-meteor-head" />
        </span>
        <span className="portal-meteor portal-meteor-c">
          <span className="portal-meteor-tail" />
          <span className="portal-meteor-head" />
        </span>
      </div>

      {/* Soft drifting cloud veils (subtle, over art) */}
      <div className="portal-cloud-veil portal-cloud-veil-a" />
      <div className="portal-cloud-veil portal-cloud-veil-b" />
      <div className="portal-cloud-veil portal-cloud-veil-c" />

      <PassingDino />

      <div className="portal-desert-vignette" />
    </div>
  );
}
