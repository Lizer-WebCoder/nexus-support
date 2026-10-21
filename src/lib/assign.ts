import type { Agent, Ticket } from '../types';

export type AssignMode = 'manual' | 'least_busy' | 'branch' | 'round_robin';

const RR_KEY = 'nexus-assign-rr-v1';
const MODE_KEY = 'nexus-assign-mode-v1';

export function getAssignMode(): AssignMode {
  try {
    const m = localStorage.getItem(MODE_KEY);
    if (m === 'least_busy' || m === 'branch' || m === 'round_robin' || m === 'manual') return m;
  } catch {}
  return 'least_busy';
}

export function setAssignMode(mode: AssignMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {}
}

function availableAgents(agents: Agent[]): Agent[] {
  return agents.filter((a) => a.status === 'online' || a.status === 'busy');
}

function openCount(agentId: string, tickets: Ticket[]): number {
  return tickets.filter((t) => t.assignee_id === agentId && t.status !== 'resolved' && !t.deleted_at).length;
}

/** Pick assignee based on mode. Returns undefined if manual or no agents. */
export function pickAssignee(
  agents: Agent[],
  tickets: Ticket[],
  opts?: { branch?: string; mode?: AssignMode }
): string | undefined {
  const mode = opts?.mode || getAssignMode();
  if (mode === 'manual') return undefined;

  let pool = availableAgents(agents);
  if (pool.length === 0) pool = agents.filter((a) => a.status !== 'offline');
  if (pool.length === 0) return undefined;

  if (mode === 'branch' && opts?.branch) {
    const branchPool = pool.filter(
      (a) => (a.branch || '').toLowerCase() === opts.branch!.toLowerCase()
    );
    if (branchPool.length) pool = branchPool;
  }

  if (mode === 'round_robin') {
    let idx = 0;
    try {
      idx = parseInt(localStorage.getItem(RR_KEY) || '0', 10) || 0;
    } catch {}
    const chosen = pool[idx % pool.length];
    try {
      localStorage.setItem(RR_KEY, String(idx + 1));
    } catch {}
    return chosen.id;
  }

  // least_busy (default) and branch fallback
  const sorted = [...pool].sort((a, b) => openCount(a.id, tickets) - openCount(b.id, tickets));
  return sorted[0]?.id;
}
