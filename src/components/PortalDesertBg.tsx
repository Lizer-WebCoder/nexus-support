import { useMemo } from 'react';
import PassingDino from './PassingDino';

/**
 * Reference-inspired desert night / day scene.
 * Hardcoded SVG fills (CSS vars don't resolve inside SVG stopColor in browsers).
 * Theme via html.nexus-dark / html.nexus-light on parent page.
 */
export default function PortalDesertBg() {
  const stars = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 5) % 100}%`,
        top: `${(i * 23 + 3) % 46}%`,
        size: i % 13 === 0 ? 3.2 : i % 7 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1.1,
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

      {/* Dark theme land (default) */}
      <svg
        className="portal-desert-land portal-desert-land-dark"
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pd-far-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="pd-mid-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="55%" stopColor="#5b21b6" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <linearGradient id="pd-near-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="pd-cliff-l-d" x1="0" y1="0" x2="1" y2="0.85">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="45%" stopColor="#5b21b6" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="pd-cliff-r-d" x1="1" y1="0" x2="0" y2="0.9">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#5b21b6" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="pd-ridge-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#pd-far-d)" opacity="0.82" d="M0 268 C90 238 150 210 240 225 C330 240 390 195 480 210 C570 225 640 175 740 195 C840 215 910 168 1020 190 C1130 212 1210 175 1320 195 C1380 205 1420 200 1440 208 L1440 480 L0 480 Z" />
        <path fill="url(#pd-ridge-d)" d="M0 268 C90 238 150 210 240 225 C330 240 390 195 480 210 C570 225 640 175 740 195 C840 215 910 168 1020 190 C1130 212 1210 175 1320 195 C1380 205 1420 200 1440 208 L1440 230 C1380 222 1320 212 1210 195 C1130 215 1020 200 910 180 C840 205 740 210 640 190 C570 225 480 225 390 210 C330 250 240 240 150 225 C90 255 40 265 0 285 Z" opacity="0.4" />
        <path fill="url(#pd-mid-d)" d="M0 310 C80 290 160 305 250 275 C340 245 420 285 520 260 C620 235 700 275 800 250 C900 225 980 270 1080 255 C1180 240 1280 275 1380 255 C1410 248 1430 255 1440 258 L1440 480 L0 480 Z" />
        <path fill="url(#pd-cliff-l-d)" d="M0 95 C28 110 48 155 58 210 C68 265 55 320 42 365 C28 400 12 430 0 445 Z" opacity="0.96" />
        <g stroke="#a78bfa" strokeWidth="1.1" fill="none" opacity="0.35">
          <path d="M2 160 C30 168 48 185 55 210" />
          <path d="M1 210 C32 220 50 245 52 280" />
          <path d="M0 270 C28 282 42 310 38 345" />
        </g>
        <path fill="url(#pd-cliff-r-d)" d="M1440 110 C1410 125 1388 165 1375 220 C1362 275 1378 330 1395 375 C1410 410 1428 440 1440 455 Z" opacity="0.94" />
        <path fill="url(#pd-near-d)" d="M0 365 C120 340 240 375 380 350 C520 325 640 365 780 345 C920 325 1040 370 1180 350 C1280 335 1360 360 1440 348 L1440 480 L0 480 Z" />
        <ellipse cx="195" cy="390" rx="32" ry="14" fill="#4c1d95" opacity="0.55" />
        <ellipse cx="960" cy="385" rx="26" ry="12" fill="#4c1d95" opacity="0.5" />
        <g transform="translate(115, 295)">
          <rect x="14" y="18" width="13" height="78" rx="6.5" fill="#a78bfa" />
          <rect x="0" y="42" width="15" height="10" rx="5" fill="#a78bfa" />
          <rect x="0" y="28" width="9" height="22" rx="4.5" fill="#a78bfa" />
          <rect x="24" y="52" width="15" height="9" rx="4.5" fill="#a78bfa" />
          <rect x="30" y="38" width="9" height="22" rx="4.5" fill="#a78bfa" />
        </g>
        <g transform="translate(1225, 275)">
          <rect x="16" y="8" width="15" height="95" rx="7.5" fill="#a78bfa" />
          <rect x="0" y="38" width="17" height="11" rx="5.5" fill="#a78bfa" />
          <rect x="0" y="20" width="10" height="28" rx="5" fill="#a78bfa" />
          <rect x="28" y="55" width="17" height="10" rx="5" fill="#a78bfa" />
          <rect x="35" y="38" width="10" height="26" rx="5" fill="#a78bfa" />
        </g>
        <g fill="#6d28d9" opacity="0.45">
          <ellipse cx="320" cy="385" rx="20" ry="9" />
          <ellipse cx="700" cy="380" rx="18" ry="8" />
          <ellipse cx="860" cy="392" rx="15" ry="7" />
        </g>
      </svg>

      {/* Light theme land */}
      <svg
        className="portal-desert-land portal-desert-land-light"
        viewBox="0 0 1440 480"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pd-far-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="pd-mid-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="55%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="pd-near-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <linearGradient id="pd-cliff-l-l" x1="0" y1="0" x2="1" y2="0.85">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="45%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="pd-cliff-r-l" x1="1" y1="0" x2="0" y2="0.9">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="pd-ridge-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path fill="url(#pd-far-l)" opacity="0.85" d="M0 268 C90 238 150 210 240 225 C330 240 390 195 480 210 C570 225 640 175 740 195 C840 215 910 168 1020 190 C1130 212 1210 175 1320 195 C1380 205 1420 200 1440 208 L1440 480 L0 480 Z" />
        <path fill="url(#pd-ridge-l)" d="M0 268 C90 238 150 210 240 225 C330 240 390 195 480 210 C570 225 640 175 740 195 C840 215 910 168 1020 190 C1130 212 1210 175 1320 195 C1380 205 1420 200 1440 208 L1440 230 C1380 222 1320 212 1210 195 C1130 215 1020 200 910 180 C840 205 740 210 640 190 C570 225 480 225 390 210 C330 250 240 240 150 225 C90 255 40 265 0 285 Z" opacity="0.45" />
        <path fill="url(#pd-mid-l)" d="M0 310 C80 290 160 305 250 275 C340 245 420 285 520 260 C620 235 700 275 800 250 C900 225 980 270 1080 255 C1180 240 1280 275 1380 255 C1410 248 1430 255 1440 258 L1440 480 L0 480 Z" />
        <path fill="url(#pd-cliff-l-l)" d="M0 95 C28 110 48 155 58 210 C68 265 55 320 42 365 C28 400 12 430 0 445 Z" opacity="0.96" />
        <g stroke="#e9d5ff" strokeWidth="1.1" fill="none" opacity="0.5">
          <path d="M2 160 C30 168 48 185 55 210" />
          <path d="M1 210 C32 220 50 245 52 280" />
          <path d="M0 270 C28 282 42 310 38 345" />
        </g>
        <path fill="url(#pd-cliff-r-l)" d="M1440 110 C1410 125 1388 165 1375 220 C1362 275 1378 330 1395 375 C1410 410 1428 440 1440 455 Z" opacity="0.94" />
        <path fill="url(#pd-near-l)" d="M0 365 C120 340 240 375 380 350 C520 325 640 365 780 345 C920 325 1040 370 1180 350 C1280 335 1360 360 1440 348 L1440 480 L0 480 Z" />
        <ellipse cx="195" cy="390" rx="32" ry="14" fill="#8b5cf6" opacity="0.45" />
        <ellipse cx="960" cy="385" rx="26" ry="12" fill="#8b5cf6" opacity="0.4" />
        <g transform="translate(115, 295)">
          <rect x="14" y="18" width="13" height="78" rx="6.5" fill="#7c3aed" />
          <rect x="0" y="42" width="15" height="10" rx="5" fill="#7c3aed" />
          <rect x="0" y="28" width="9" height="22" rx="4.5" fill="#7c3aed" />
          <rect x="24" y="52" width="15" height="9" rx="4.5" fill="#7c3aed" />
          <rect x="30" y="38" width="9" height="22" rx="4.5" fill="#7c3aed" />
        </g>
        <g transform="translate(1225, 275)">
          <rect x="16" y="8" width="15" height="95" rx="7.5" fill="#7c3aed" />
          <rect x="0" y="38" width="17" height="11" rx="5.5" fill="#7c3aed" />
          <rect x="0" y="20" width="10" height="28" rx="5" fill="#7c3aed" />
          <rect x="28" y="55" width="17" height="10" rx="5" fill="#7c3aed" />
          <rect x="35" y="38" width="10" height="26" rx="5" fill="#7c3aed" />
        </g>
        <g fill="#a78bfa" opacity="0.5">
          <ellipse cx="320" cy="385" rx="20" ry="9" />
          <ellipse cx="700" cy="380" rx="18" ry="8" />
          <ellipse cx="860" cy="392" rx="15" ry="7" />
        </g>
      </svg>

      <PassingDino />

      <div className="portal-desert-haze" />
      <div className="portal-desert-vignette" />
    </div>
  );
}
