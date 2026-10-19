import clsx from 'clsx';
import { useTickets } from '../context/TicketContext';
import type { AgentStatus } from '../types';

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  online: { label: 'Online', color: 'text-emerald-700 bg-emerald-50', dot: 'bg-emerald-400' },
  busy: { label: 'Busy', color: 'text-amber-700 bg-amber-50', dot: 'bg-amber-400' },
  away: { label: 'Away', color: 'text-slate-600 bg-slate-100', dot: 'bg-slate-400' },
  offline: { label: 'Offline', color: 'text-slate-500 bg-slate-50', dot: 'bg-slate-300' },
};

export default function TeamPage() {
  const { agents, tickets, currentAgent, updateAgentStatus } = useTickets();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {agents.filter((a) => a.status === 'online' || a.status === 'busy').length} of {agents.length} agents active
        </p>
        {currentAgent && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Your status</span>
            <select
              value={currentAgent.status}
              onChange={(e) => updateAgentStatus(e.target.value as AgentStatus)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="away">Away</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Agent</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Open tickets</th>
              <th className="px-5 py-3 font-medium">Resolved</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const open = tickets.filter((t) => t.assignee_id === agent.id && t.status !== 'resolved').length;
              const resolved = tickets.filter((t) => t.assignee_id === agent.id && t.status === 'resolved').length;
              const cfg = statusConfig[agent.status] || statusConfig.offline;
              const isYou = currentAgent?.id === agent.id;
              return (
                <tr key={agent.id} className={clsx('border-b border-slate-100 hover:bg-slate-50/50', isYou && 'bg-sky-50/40')}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold', agent.color)}>
                          {agent.initials}
                        </div>
                        <div className={clsx('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white', cfg.dot)} />
                      </div>
                      <div>
                        <span className="font-medium text-slate-800">{agent.name}</span>
                        {isYou && (
                          <span className="ml-2 text-[10px] font-semibold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{agent.role}</td>
                  <td className="px-5 py-3.5">
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums text-slate-800">{open}</td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-600">{resolved}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
