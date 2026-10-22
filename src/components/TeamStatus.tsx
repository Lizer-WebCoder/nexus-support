import clsx from 'clsx';
import { useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import AgentAvatar from './AgentAvatar';

const statusDot: Record<string, string> = {
  online: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-slate-400',
  offline: 'bg-slate-300',
};

function isDisplayAgent(a: { role?: string; approval_status?: string | null }) {
  const role = (a.role || '').toLowerCase();
  if (role.includes('customer')) return false;
  if (a.approval_status === 'rejected') return false;
  return true;
}

export default function TeamStatus() {
  const { agents, tickets } = useTickets();

  const team = useMemo(() => {
    const list = agents.filter(isDisplayAgent);
    const seen = new Set<string>();
    return list.filter((a) => {
      const key = (a.email || a.name || a.id).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [agents]);

  const active = team.filter((a) => a.status === 'online' || a.status === 'busy').length;

  return (
    <div className="bg-white rounded-2xl border border-violet-100/80 shadow-sm shadow-violet-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800">Team Status</h2>
        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
          {active} active
        </span>
      </div>
      {team.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No agents yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {team.map((agent) => {
            const count = tickets.filter(
              (t) => t.assignee_id === agent.id && t.status !== 'resolved'
            ).length;
            return (
              <div
                key={agent.id}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-transparent hover:border-violet-100 hover:bg-violet-50/40 transition-colors"
              >
                <div className="relative shrink-0">
                  <AgentAvatar agent={agent} size="md" />
                  <div
                    className={clsx(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                      statusDot[agent.status] || statusDot.offline
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 truncate">{agent.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {count} ticket{count === 1 ? '' : 's'} · {agent.is_admin ? 'Admin' : 'Agent'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
