import { useMemo } from 'react';
import PassingDino from './PassingDino';

/**
 * Reference-inspired desert night / day scene.
 * Deep sky, bright moon (upper-right), layered dunes + cliffs + cacti,
 * twinkling stars, long-tail shooting stars, soft drifting clouds.
 * Theme via html.nexus-dark / html.nexus-light.
 */
export default function PortalDesertBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 72 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 5) % 100}%`,
        top: `${(i * 23 + 3) % 48}%`,
        size: i % 13 === 0 ? 3.4 : i % 7 === 0 ? 2.4 : i % 3 === 0 ? 1.7 : 1.15,
        delay: `${(i * 0.29) % 5.5}s`,
        duration: `${1.9 + (i % 7) * 0.4}s`,
        bright: i % 6 === 0,
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

      {/* Shooting stars — head + long glowing tail */}
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
        <span className="portal-meteor portal-meteor-d">
          <span className="portal-meteor-tail" />
          <span className="portal-meteor-head" />
        </span>
      </div>

      <div className="portal-desert-moon-wrap">
        <div className="portal-desert-moon-halo" />
        <div className="portal-desert-moon" />
        <div className="portal-desert-moon-craters" />
      </div>

      {/* Soft multi-lobe cloud veils */}
      <div className="portal-cloud portal-cloud-a">
        <span className="portal-cloud-lobe l1" />
        <span className="portal-cloud-lobe l2" />
        <span className="portal-cloud-lobe l3" />
      </div>
      <div className="portal-cloud portal-cloud-b">
        <span className="portal-cloud-lobe l1" />
        <span className="portal-cloud-lobe l2" />
        <span className="portal-cloud-lobe l3" />
      </div>
      <div className="portal-cloud portal-cloud-c">
        <span className="portal-cloud-lobe l1" />
        <span className="portal-cloud-lobe l2" />
      </div>

      {/* Landscape — layered mountains / dunes / cliffs matching reference */}
      <svg
        className="portal-desert-land"
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pd-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-far-top)" />
            <stop offset="100%" stopColor="var(--pd-far-bot)" />
          </linearGradient>
          <linearGradient id="pd-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-mid-top)" />
            <stop offset="55%" stopColor="var(--pd-mid-mid)" />
            <stop offset="100%" stopColor="var(--pd-mid-bot)" />
          </linearGradient>
          <linearGradient id="pd-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-near-top)" />
            <stop offset="100%" stopColor="var(--pd-near-bot)" />
          </linearGradient>
          <linearGradient id="pd-cliff-l" x1="0" y1="0" x2="1" y2="0.85">
            <stop offset="0%" stopColor="var(--pd-cliff-hi)" />
            <stop offset="45%" stopColor="var(--pd-cliff-mid)" />
            <stop offset="100%" stopColor="var(--pd-cliff-lo)" />
          </linearGradient>
          <linearGradient id="pd-cliff-r" x1="1" y1="0" x2="0" y2="0.9">
            <stop offset="0%" stopColor="var(--pd-cliff-hi)" />
            <stop offset="50%" stopColor="var(--pd-cliff-mid)" />
            <stop offset="100%" stopColor="var(--pd-cliff-lo)" />
          </linearGradient>
          <linearGradient id="pd-ridge-lit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--pd-ridge-hi)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--pd-ridge-hi)" stopOpacity="0" />
          </linearGradient>
          <filter id="pd-soft" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Far mountain range — soft atmospheric */}
        <path
          fill="url(#pd-far)"
          opacity="0.78"
          d="M0 268
             C90 238 150 210 240 225
             C330 240 390 195 480 210
             C570 225 640 175 740 195
             C840 215 910 168 1020 190
             C1130 212 1210 175 1320 195
             C1380 205 1420 200 1440 208
             L1440 480 L0 480 Z"
        />
        {/* Far ridge highlight */}
        <path
          fill="url(#pd-ridge-lit)"
          d="M0 268 C90 238 150 210 240 225 C330 240 390 195 480 210
             C570 225 640 175 740 195 C840 215 910 168 1020 190
             C1130 212 1210 175 1320 195 C1380 205 1420 200 1440 208
             L1440 230 C1380 222 1320 212 1210 195 C1130 215 1020 200 910 180
             C840 205 740 210 640 190 C570 225 480 225 390 210 C330 250 240 240 150 225
             C90 255 40 265 0 285 Z"
          opacity="0.45"
        />

        {/* Mid range — more peaks */}
        <path
          fill="url(#pd-mid)"
          d="M0 310
             C80 290 160 305 250 275
             C340 245 420 285 520 260
             C620 235 700 275 800 250
             C900 225 980 270 1080 255
             C1180 240 1280 275 1380 255
             C1410 248 1430 255 1440 258
             L1440 480 L0 480 Z"
        />
        {/* Mid ridge edge */}
        <path
          fill="none"
          stroke="var(--pd-ridge-edge)"
          strokeWidth="1.2"
          opacity="0.35"
          d="M0 310 C80 290 160 305 250 275 C340 245 420 285 520 260
             C620 235 700 275 800 250 C900 225 980 270 1080 255
             C1180 240 1280 275 1380 255 C1410 248 1430 255 1440 258"
        />

        {/* Left cliff face — tall, stratified */}
        <path
          fill="url(#pd-cliff-l)"
          d="M0 95
             C28 110 48 155 58 210
             C68 265 55 320 42 365
             C28 400 12 430 0 445
             Z"
          opacity="0.96"
        />
        {/* Left cliff strata lines */}
        <g stroke="var(--pd-cliff-strata)" strokeWidth="1.1" fill="none" opacity="0.4">
          <path d="M2 160 C30 168 48 185 55 210" />
          <path d="M1 210 C32 220 50 245 52 280" />
          <path d="M0 270 C28 282 42 310 38 345" />
          <path d="M0 330 C22 345 32 370 28 400" />
        </g>
        {/* Left cliff highlight edge */}
        <path
          fill="var(--pd-cliff-edge)"
          opacity="0.28"
          d="M0 110 C25 125 42 160 50 200 C55 240 42 290 32 330 L0 340 Z"
        />

        {/* Right cliff face */}
        <path
          fill="url(#pd-cliff-r)"
          d="M1440 110
             C1410 125 1388 165 1375 220
             C1362 275 1378 330 1395 375
             C1410 410 1428 440 1440 455
             Z"
          opacity="0.94"
        />
        <g stroke="var(--pd-cliff-strata)" strokeWidth="1.1" fill="none" opacity="0.38">
          <path d="M1438 170 C1410 180 1390 200 1380 235" />
          <path d="M1439 230 C1408 245 1388 275 1382 315" />
          <path d="M1440 300 C1415 318 1395 350 1395 385" />
        </g>
        <path
          fill="var(--pd-cliff-edge)"
          opacity="0.25"
          d="M1440 130 C1415 145 1395 185 1385 230 C1378 275 1390 320 1400 355 L1440 365 Z"
        />

        {/* Near dunes — rolling foreground */}
        <path
          fill="url(#pd-near)"
          d="M0 365
             C120 340 240 375 380 350
             C520 325 640 365 780 345
             C920 325 1040 370 1180 350
             C1280 335 1360 360 1440 348
             L1440 480 L0 480 Z"
        />
        {/* Near dune soft crest */}
        <path
          fill="var(--pd-near-crest)"
          opacity="0.22"
          d="M0 365 C120 340 240 375 380 350 C520 325 640 365 780 345
             C920 325 1040 370 1180 350 C1280 335 1360 360 1440 348
             L1440 375 C1360 385 1280 360 1180 365 C1040 385 920 340 780 360
             C640 380 520 340 380 365 C240 390 120 355 0 380 Z"
        />

        {/* Rocks / boulders */}
        <ellipse cx="195" cy="390" rx="32" ry="14" fill="var(--pd-rock)" opacity="0.55" />
        <ellipse cx="225" cy="398" rx="16" ry="9" fill="var(--pd-rock)" opacity="0.4" />
        <ellipse cx="960" cy="385" rx="26" ry="12" fill="var(--pd-rock)" opacity="0.5" />
        <ellipse cx="1085" cy="400" rx="20" ry="10" fill="var(--pd-rock)" opacity="0.42" />
        <ellipse cx="620" cy="405" rx="18" ry="8" fill="var(--pd-rock)" opacity="0.35" />

        {/* Left cactus cluster */}
        <g className="portal-desert-cactus-g" transform="translate(115, 295)">
          <rect x="14" y="18" width="13" height="78" rx="6.5" fill="var(--pd-cactus)" />
          <rect x="0" y="42" width="15" height="10" rx="5" fill="var(--pd-cactus)" />
          <rect x="0" y="28" width="9" height="22" rx="4.5" fill="var(--pd-cactus)" />
          <rect x="24" y="52" width="15" height="9" rx="4.5" fill="var(--pd-cactus)" />
          <rect x="30" y="38" width="9" height="22" rx="4.5" fill="var(--pd-cactus)" />
          {/* spines hint */}
          <g stroke="var(--pd-cactus-spine)" strokeWidth="0.8" opacity="0.5">
            <line x1="16" y1="30" x2="12" y2="28" />
            <line x1="25" y1="45" x2="29" y2="43" />
            <line x1="18" y1="60" x2="14" y2="58" />
          </g>
          <ellipse cx="20" cy="100" rx="18" ry="6" fill="var(--pd-rock)" opacity="0.32" />
        </g>
        {/* Small left cactus */}
        <g transform="translate(175, 340)">
          <rect x="6" y="8" width="8" height="42" rx="4" fill="var(--pd-cactus)" opacity="0.9" />
          <rect x="0" y="22" width="7" height="6" rx="3" fill="var(--pd-cactus)" opacity="0.9" />
          <rect x="0" y="16" width="5" height="12" rx="2.5" fill="var(--pd-cactus)" opacity="0.9" />
        </g>

        {/* Right cactus */}
        <g className="portal-desert-cactus-g" transform="translate(1225, 275)">
          <rect x="16" y="8" width="15" height="95" rx="7.5" fill="var(--pd-cactus)" />
          <rect x="0" y="38" width="17" height="11" rx="5.5" fill="var(--pd-cactus)" />
          <rect x="0" y="20" width="10" height="28" rx="5" fill="var(--pd-cactus)" />
          <rect x="28" y="55" width="17" height="10" rx="5" fill="var(--pd-cactus)" />
          <rect x="35" y="38" width="10" height="26" rx="5" fill="var(--pd-cactus)" />
          <g stroke="var(--pd-cactus-spine)" strokeWidth="0.9" opacity="0.45">
            <line x1="18" y1="25" x2="14" y2="22" />
            <line x1="28" y1="50" x2="32" y2="47" />
            <line x1="20" y1="70" x2="16" y2="68" />
          </g>
          <ellipse cx="23" cy="108" rx="22" ry="7" fill="var(--pd-rock)" opacity="0.32" />
        </g>

        {/* Sparse shrubs */}
        <g fill="var(--pd-shrub)" opacity="0.5">
          <ellipse cx="320" cy="385" rx="20" ry="9" />
          <ellipse cx="345" cy="378" rx="14" ry="11" />
          <ellipse cx="700" cy="380" rx="18" ry="8" />
          <ellipse cx="860" cy="392" rx="15" ry="7" />
          <ellipse cx="1050" cy="378" rx="12" ry="6" />
        </g>
      </svg>

      <PassingDino />

      <div className="portal-desert-haze" />
      <div className="portal-desert-vignette" />
    </div>
  );
}
