import { Activity, Clock, Users, Shield, Wifi } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function MetricBar() {
  const { tickets, agents } = useTickets();

  const openChats = tickets.filter((t) => ['new', 'open', 'pending'].includes(t.status)).length;
  const agentsOnline = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;
  const breached = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;
  const slaHealth = Math.max(70, 100 - breached * 3 - Math.floor(openChats / 5));

  return (
    <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-wrap items-center gap-6 lg:gap-8 shadow-lg">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Support Live</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Wifi size={12} />
            99.7% uptime
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Open Chats</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{openChats}</span>
          <Activity size={16} className="text-sky-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Avg Wait</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">1m 42s</span>
          <Clock size={16} className="text-amber-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Agents Online</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{agentsOnline}</span>
          <Users size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      <div className="flex flex-col min-w-[110px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">SLA Score</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums text-emerald-400">{slaHealth}%</span>
          <Shield size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="ml-auto text-right hidden lg:block">
        <div className="text-[11px] text-slate-400">Day Shift</div>
        <div className="text-sm font-medium">{agents.length} agents</div>
      </div>
    </div>
  );
}
