import { Activity, Clock, Users, Shield, Radio } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function MetricBar() {
  const { tickets, agents } = useTickets();

  const openChats = tickets.filter((t) => ['new', 'open', 'pending'].includes(t.status)).length;
  const agentsOnline = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;
  const breached = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;
  const slaHealth = Math.max(70, 100 - breached * 3 - Math.floor(openChats / 5));

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-brand-950 to-zinc-900 text-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-6 lg:gap-8 shadow-lg border border-white/5">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Ops live</div>
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Radio size={12} />
            99.7% uptime
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Open queue</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{openChats}</span>
          <Activity size={16} className="text-brand-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Avg wait</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">1m 42s</span>
          <Clock size={16} className="text-amber-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Agents online</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{agentsOnline}</span>
          <Users size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[110px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">SLA score</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums text-emerald-400">{slaHealth}%</span>
          <Shield size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="ml-auto text-right hidden lg:block">
        <div className="text-[11px] text-zinc-400">Day shift</div>
        <div className="text-sm font-medium">{agents.length} agents</div>
      </div>
    </div>
  );
}
