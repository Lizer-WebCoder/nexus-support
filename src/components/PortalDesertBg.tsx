import { useMemo } from 'react';
import PassingDino from './PassingDino';

/**
 * Polished desert night scene (reference-inspired):
 * deep sky, bright moon, layered dunes, cliffs, cacti, twinkling + shooting stars.
 * Light/dark via html.nexus-* CSS variables.
 */
export default function PortalDesertBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 5) % 100}%`,
        top: `${(i * 23 + 3) % 52}%`,
        size: i % 11 === 0 ? 3.2 : i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.1,
        delay: `${(i * 0.31) % 5}s`,
        duration: `${1.8 + (i % 6) * 0.45}s`,
        bright: i % 7 === 0,
      })),
    [],
  );

  return (
    <div className="portal-desert" aria-hidden>
      <div className="portal-desert-sky" />
      <div className="portal-desert-sky-glow" />

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

      <span className="portal-desert-shoot portal-desert-shoot-a" />
      <span className="portal-desert-shoot portal-desert-shoot-b" />
      <span className="portal-desert-shoot portal-desert-shoot-c" />

      <div className="portal-desert-moon-wrap">
        <div className="portal-desert-moon-halo" />
        <div className="portal-desert-moon" />
      </div>

      <div className="portal-desert-cloud portal-desert-cloud-a" />
      <div className="portal-desert-cloud portal-desert-cloud-b" />
      <div className="portal-desert-cloud portal-desert-cloud-c" />

      <svg className="portal-desert-land" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="pd-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-far-top)" />
            <stop offset="100%" stopColor="var(--pd-far-bot)" />
          </linearGradient>
          <linearGradient id="pd-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-mid-top)" />
            <stop offset="100%" stopColor="var(--pd-mid-bot)" />
          </linearGradient>
          <linearGradient id="pd-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-near-top)" />
            <stop offset="100%" stopColor="var(--pd-near-bot)" />
          </linearGradient>
          <linearGradient id="pd-cliff-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--pd-cliff-hi)" />
            <stop offset="100%" stopColor="var(--pd-cliff-lo)" />
          </linearGradient>
          <linearGradient id="pd-cliff-r" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-cliff-hi)" />
            <stop offset="100%" stopColor="var(--pd-cliff-lo)" />
          </linearGradient>
        </defs>

        <path
          fill="url(#pd-far)"
          opacity="0.7"
          d="M0 250 C80 220 160 200 260 210 C360 220 420 180 520 195 C620 210 700 170 820 190 C940 210 1020 175 1140 195 C1240 210 1340 190 1440 205 L1440 420 L0 420 Z"
        />

        <path
          fill="url(#pd-mid)"
          d="M0 290 C120 265 240 285 380 260 C520 235 620 275 760 250 C900 225 1040 270 1180 255 C1280 245 1380 265 1440 250 L1440 420 L0 420 Z"
        />

        <path
          fill="url(#pd-cliff-l)"
          d="M0 120 C40 140 55 200 70 250 C85 300 60 340 40 380 C20 400 0 410 0 410 Z"
          opacity="0.95"
        />
        <path
          fill="var(--pd-cliff-edge)"
          opacity="0.35"
          d="M0 160 C35 175 50 210 58 250 C65 290 45 330 30 360 L0 370 Z"
        />

        <path
          fill="url(#pd-cliff-r)"
          d="M1440 140 C1400 155 1380 210 1365 260 C1350 310 1375 350 1395 385 C1415 405 1440 415 1440 415 Z"
          opacity="0.92"
        />

        <path
          fill="url(#pd-near)"
          d="M0 340 C180 320 320 350 500 330 C700 308 860 348 1050 325 C1200 310 1340 340 1440 325 L1440 420 L0 420 Z"
        />

        <ellipse cx="220" cy="360" rx="28" ry="12" fill="var(--pd-rock)" opacity="0.55" />
        <ellipse cx="250" cy="365" rx="14" ry="8" fill="var(--pd-rock)" opacity="0.4" />
        <ellipse cx="980" cy="355" rx="22" ry="10" fill="var(--pd-rock)" opacity="0.5" />
        <ellipse cx="1100" cy="370" rx="18" ry="9" fill="var(--pd-rock)" opacity="0.45" />

        <g className="portal-desert-cactus-g" transform="translate(130, 268)">
          <rect x="10" y="20" width="12" height="70" rx="6" fill="var(--pd-cactus)" />
          <rect x="0" y="38" width="14" height="9" rx="4" fill="var(--pd-cactus)" />
          <rect x="0" y="28" width="9" height="18" rx="4" fill="var(--pd-cactus)" />
          <rect x="18" y="48" width="14" height="8" rx="4" fill="var(--pd-cactus)" />
          <rect x="24" y="36" width="8" height="20" rx="4" fill="var(--pd-cactus)" />
          <ellipse cx="16" cy="92" rx="16" ry="5" fill="var(--pd-rock)" opacity="0.35" />
        </g>

        <g className="portal-desert-cactus-g" transform="translate(1240, 250)">
          <rect x="14" y="10" width="14" height="90" rx="7" fill="var(--pd-cactus)" />
          <rect x="0" y="40" width="16" height="10" rx="5" fill="var(--pd-cactus)" />
          <rect x="0" y="22" width="10" height="28" rx="5" fill="var(--pd-cactus)" />
          <rect x="26" y="55" width="16" height="9" rx="5" fill="var(--pd-cactus)" />
          <rect x="32" y="40" width="10" height="24" rx="5" fill="var(--pd-cactus)" />
          <ellipse cx="21" cy="102" rx="20" ry="6" fill="var(--pd-rock)" opacity="0.35" />
        </g>

        <g fill="var(--pd-shrub)" opacity="0.55">
          <ellipse cx="340" cy="355" rx="18" ry="8" />
          <ellipse cx="360" cy="350" rx="12" ry="10" />
          <ellipse cx="720" cy="348" rx="16" ry="7" />
          <ellipse cx="880" cy="360" rx="14" ry="6" />
        </g>
      </svg>

      <PassingDino />

      <div className="portal-desert-haze" />
      <div className="portal-desert-vignette" />
    </div>
  );
}
