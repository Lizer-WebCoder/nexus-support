import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SpacePlanets from './SpacePlanets';

interface Props {
  onOpenPortal?: () => void;
}

function useFallingStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 41 + 13) % 100}%`,
        size: i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
        delay: -((i * 0.37) % 20),
        duration: 8 + (i % 11) * 1.4,
        color: i % 4 === 0 ? '#ff66cc' : i % 3 === 0 ? '#66f0ff' : '#c4b5fd',
        opacity: 0.35 + (i % 6) * 0.1,
      })),
    [count]
  );
}

function NexusLogoMark({ size = 56 }: { size?: number }) {
  return (
    <div className="login-logo-mark" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
        <circle cx="24" cy="24" r="5.5" fill="white" className="login-logo-core" />
        <g className="login-logo-arcs">
          <path d="M24 6a18 18 0 0 1 18 18" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M24 42a18 18 0 0 1-18-18" stroke="white" strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}
