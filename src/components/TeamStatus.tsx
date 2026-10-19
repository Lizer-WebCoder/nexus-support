import { agents } from '../data';
import clsx from 'clsx';

const statusDot: Record<string, string> = {
  online: 'bg-emerald-400',
  busy: 'bg-amber-400',
  away: 'bg-slate-400',
  offline: 'bg-slate-300',
};

export default function TeamStatus() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800">Team Status</h2>
        <span className="text-xs text-slate-500">
          {agents.filter((a) => a.status === 'online' || a.status === 'busy').length} active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="relative">
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                  agent.color
                )}
              >
                {agent.initials}
              </div>
              <div
                className={clsx(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                  statusDot[agent.status]
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-800 truncate">{agent.name}</div>
              <div className="text-[11px] text-slate-500">
                {agent.tickets} tickets · {agent.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
