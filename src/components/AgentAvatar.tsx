import clsx from 'clsx';
import type { Agent } from '../types';

type AgentLike = Pick<Agent, 'id' | 'name' | 'initials' | 'color' | 'avatar_url'>;

/** Resolve photo URL: DB column, then localStorage fallback from Profile save. */
export function resolveAgentAvatar(
  agent: Pick<Agent, 'id' | 'avatar_url'> | null | undefined
): string | null {
  if (!agent) return null;
  if (agent.avatar_url) return agent.avatar_url;
  try {
    if (agent.id) {
      const local = localStorage.getItem(`nexus-avatar-${agent.id}`);
      if (local) return local;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function isCssColor(c?: string | null): boolean {
  if (!c) return false;
  return c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl');
}

interface Props {
  /** Preferred: full agent row */
  agent?: AgentLike | null;
  /** Alternate API used by App header / Sidebar-style callers */
  name?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

/** Shared agent avatar: photo when available, else initials. Safe if agent is missing. */
export default function AgentAvatar({
  agent,
  name,
  avatarUrl,
  size = 'md',
  className,
}: Props) {
  const displayName = agent?.name || name || '?';
  const initials =
    agent?.initials ||
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') ||
    displayName.slice(0, 2).toUpperCase();

  const src =
    (avatarUrl && String(avatarUrl).trim()) ||
    resolveAgentAvatar(agent) ||
    null;

  const color = agent?.color || '#6366f1';

  const box =
    typeof size === 'number'
      ? undefined
      : sizeClasses[size] || sizeClasses.md;

  const numericStyle =
    typeof size === 'number'
      ? { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.35)) }
      : undefined;

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className={clsx(
          box,
          'rounded-full object-cover shrink-0 ring-1 ring-black/5',
          className
        )}
        style={numericStyle}
      />
    );
  }

  return (
    <div
      className={clsx(
        box,
        'rounded-full flex items-center justify-center text-white font-semibold shrink-0',
        !isCssColor(color) && color,
        className
      )}
      style={{
        ...(isCssColor(color) ? { backgroundColor: color } : {}),
        ...numericStyle,
      }}
    >
      {initials}
    </div>
  );
}
