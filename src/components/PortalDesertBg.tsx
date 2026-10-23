import { useMemo } from 'react';

/** Cartoon desert night sky — light & dark via CSS (html.nexus-*). */
export default function PortalDesertBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 7) % 100}%`,
        top: `${(i * 29 + 5) % 58}%`,
        size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1.2,
        delay: `${(i * 0.37) % 4}s`,
        duration: `${2.2 + (i % 5) * 0.55}s`,
      })),
    [],
  );

  return (
    <div className="portal-desert" aria-hidden>
      <div className="portal-desert-sky" />
      <div className="portal-desert-stars">
        {stars.map((s) => (
          <span
            key={s.id}
            className="portal-desert-star"
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

      {/* Shooting stars */}
      <span className="portal-desert-shoot portal-desert-shoot-a" />
      <span className="portal-desert-shoot portal-desert-shoot-b" />
      <span className="portal-desert-shoot portal-desert-shoot-c" />

      {/* Moon */}
      <div className="portal-desert-moon" />

      {/* Soft clouds */}
      <div className="portal-desert-cloud portal-desert-cloud-a" />
      <div className="portal-desert-cloud portal-desert-cloud-b" />

      {/* Far mountains + dunes (SVG silhouette) */}
      <svg className="portal-desert-land" viewBox="0 0 1200 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pd-dune" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-dune-top)" />
            <stop offset="100%" stopColor="var(--pd-dune-bot)" />
          </linearGradient>
        </defs>
        {/* distant ridges */}
        <path
          fill="var(--pd-ridge)"
          d="M0 210 C120 180 200 150 320 165 C420 178 480 140 580 155 C700 175 760 130 880 150 C980 165 1080 145 1200 160 L1200 320 L0 320 Z"
          opacity="0.55"
        />
        {/* main dunes */}
        <path
          fill="url(#pd-dune)"
          d="M0 250 C150 220 280 235 420 215 C560 195 640 240 780 220 C920 200 1040 235 1200 215 L1200 320 L0 320 Z"
        />
        {/* near sand */}
        <path
          fill="var(--pd-sand)"
          d="M0 280 C200 260 360 290 520 270 C700 248 860 285 1200 265 L1200 320 L0 320 Z"
          opacity="0.9"
        />
      </svg>

      {/* Cacti accents */}
      <svg className="portal-desert-cactus portal-desert-cactus-l" viewBox="0 0 40 70" fill="none">
        <path
          d="M18 68 V28 C18 18 22 12 28 12 C34 12 36 18 36 24 V32"
          stroke="var(--pd-cactus)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M18 42 H8 C4 42 4 36 8 36 H18" stroke="var(--pd-cactus)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg className="portal-desert-cactus portal-desert-cactus-r" viewBox="0 0 40 70" fill="none">
        <path
          d="M22 68 V22 C22 14 26 10 30 10 C35 10 37 15 37 22 V30"
          stroke="var(--pd-cactus)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M22 38 H12 C8 38 8 32 12 32 H22" stroke="var(--pd-cactus)" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
