import clsx from 'clsx';
import type { Agent } from '../types';

/** Resolve photo URL: DB column, then localStorage fallback from Profile save. */
export function resolveAgentAvatar(agent: Pick<Agent, 'id' | 'avatar_url'>): string | null {
  if (agent.avatar_url) return agent.avatar_url;
  try {
    const local = localStorage.getItem(`nexus-avatar-${agent.id}`);
    if (local) return local;
  } catch {}
  return null;
}

function isCssColor(c?: string | null): boolean {
  if (!c) return false;
  return c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl');
}

interface Props {
  agent: Pick<Agent, 'id' | 'name' | 'initials' | 'color' | 'avatar_url'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

/** Shared agent avatar: photo when available, else initials. */
export default function AgentAvatar({ agent, size = 'md', className }: Props) {
  const src = resolveAgentAvatar(agent);
  const box = sizes[size];
  const color = agent.color || '#6366f1';

  if (src) {
    return (
      <img
        src={src}
        alt={agent.name}
        className={clsx(box, 'rounded-full object-cover shrink-0 ring-1 ring-black/5', className)}
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
      style={isCssColor(color) ? { backgroundColor: color } : undefined}
    >
      {agent.initials || agent.name.slice(0, 2).toUpperCase()}
    </div>
  );
}
