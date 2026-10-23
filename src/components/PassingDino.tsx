import { useEffect, useState } from 'react';

type Pass = { id: number; dir: 'ltr' | 'rtl'; duration: number };

/**
 * Smooth black T-rex silhouette that crosses the desert skyline
 * every 20–30s, direction chosen at random.
 */
export default function PassingDino() {
  const [pass, setPass] = useState<Pass | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let timer = 0;
    let n = 0;

    const arm = (first: boolean) => {
      const wait = first ? 7000 + Math.random() * 5000 : 20000 + Math.random() * 10000;
      timer = window.setTimeout(() => {
        n += 1;
        setPass({
          id: n,
          dir: Math.random() < 0.5 ? 'ltr' : 'rtl',
          duration: 6.2 + Math.random() * 2.4,
        });
        arm(false);
      }, wait);
    };

    arm(true);
    return () => window.clearTimeout(timer);
  }, []);

  if (!pass) return null;

  return (
    <div className="passing-dino-layer" aria-hidden>
      <style>{`
        .passing-dino-layer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 18%;
          height: 88px;
          z-index: 4;
          pointer-events: none;
          overflow: visible;
        }
        .passing-dino {
          position: absolute;
          bottom: 0;
          width: 92px;
          height: 64px;
          color: #0b0b0d;
          filter: drop-shadow(0 8px 6px rgba(0,0,0,0.28));
          will-change: left;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        .passing-dino.ltr { animation-name: passing-dino-ltr; }
        .passing-dino.rtl { animation-name: passing-dino-rtl; }
        .passing-dino.rtl .passing-dino-art { transform: scaleX(-1); transform-origin: center; }
        @keyframes passing-dino-ltr {
          from { left: -110px; }
          to { left: calc(100% + 110px); }
        }
        @keyframes passing-dino-rtl {
          from { left: calc(100% + 110px); }
          to { left: -110px; }
        }
        .passing-dino-art { width: 100%; height: 100%; display: block; }
        .dino-leg { transform-box: fill-box; transform-origin: 50% 0%; }
        .dino-leg.a { animation: dino-step 0.22s ease-in-out infinite alternate; }
        .dino-leg.b { animation: dino-step 0.22s ease-in-out infinite alternate-reverse; }
        @keyframes dino-step {
          from { transform: rotate(-14deg); }
          to { transform: rotate(16deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .passing-dino, .dino-leg { animation: none !important; display: none; }
        }
      `}</style>
      <div
        key={pass.id}
        className={`passing-dino ${pass.dir}`}
        style={{ animationDuration: `${pass.duration}s` }}
      >
        <svg className="passing-dino-art" viewBox="0 0 180 110" fill="currentColor" aria-hidden>
          <path d="M78 64C42 74 20 62 8 46c-4-6 2-12 8-8 14 8 32 14 56 16l6 10z" />
          <ellipse cx="102" cy="58" rx="36" ry="20" />
          <path d="M126 50c8-18 22-28 40-28 10 0 16 8 12 16-4 8-14 10-22 6l-6 10c-6 6-16 8-24 4v-8z" />
          <path d="M154 40c12 2 18 8 14 14-4 6-16 4-22-2l8-12z" />
          <path d="M130 64l14 10-4 5-14-8z" />
          <g className="dino-leg a">
            <path d="M86 72l-8 28h12l6-24z" />
          </g>
          <g className="dino-leg b">
            <path d="M112 72l6 28h12l-8-28z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
