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

const CHAT_LINES = [
  'WOAH COOL',
  'NICE TRAIL!',
  'Is that Nexus?',
  'Sick logo',
  'Beep boop',
  'Over here!',
  'Support desk?',
  'Zoom!',
  'Hello agents',
  'To the branch!',
  'Copy that',
  'Need backup?',
  'Tickets flying!',
  'SLA green',
  'Branch online',
  'Portal live',
  'Route me in',
  'Clear skies',
  'Warp speed',
  'Got a ticket?',
];

type Flyby = {
  id: number;
  kind: 'ufo' | 'ship';
  top: number;
  duration: number;
  fromLeft: boolean;
  chat: string | null;
};

function UfoIcon() {
  return (
    <svg width="56" height="28" viewBox="0 0 56 28" fill="none">
      <ellipse cx="28" cy="18" rx="24" ry="7" fill="#94a3b8" opacity="0.9" />
      <ellipse cx="28" cy="16" rx="18" ry="5" fill="#cbd5e1" />
      <ellipse cx="28" cy="12" rx="10" ry="8" fill="#a5b4fc" />
      <ellipse cx="28" cy="10" rx="7" ry="5" fill="#c7d2fe" opacity="0.7" />
      <circle cx="20" cy="18" r="1.5" fill="#f0abfc" />
      <circle cx="28" cy="19" r="1.5" fill="#67e8f9" />
      <circle cx="36" cy="18" r="1.5" fill="#fde68a" />
    </svg>
  );
}

function ShipIcon() {
  return (
    <svg width="72" height="28" viewBox="0 0 72 28" fill="none" aria-hidden>
      <ellipse cx="10" cy="14" rx="10" ry="5" fill="url(#rocketFlame)" opacity="0.9" />
      <path d="M14 10 L14 18 L8 20 L4 14 L8 8 Z" fill="#c4b5fd" opacity="0.85" />
      <path d="M16 9 L52 6 L66 14 L52 22 L16 19 Z" fill="#e2e8f0" />
      <path d="M52 6 L66 14 L52 22 Z" fill="#a5b4fc" />
      <rect x="28" y="11" width="12" height="6" rx="1.5" fill="#67e8f9" opacity="0.9" />
      <circle cx="58" cy="14" r="2.2" fill="#fde68a" />
      <path d="M22 9 L18 4 L24 9 Z" fill="#94a3b8" />
      <path d="M22 19 L18 24 L24 19 Z" fill="#94a3b8" />
      <defs>
        <radialGradient id="rocketFlame" cx="80%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor="#f97316" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}
