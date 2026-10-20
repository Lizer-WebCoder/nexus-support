import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock, Users, Shield, Radio, RefreshCw } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
}

export default function MetricBar() {
  const { tickets, agents, usingSupabase, refresh, loading } = useTickets();
  const [now, setNow] = useState(() => Date.now());
  const [lastSynced, setLastSynced] = useState(() => Date.now());

  // Tick every second so avg wait / SLA stay live without a full page reload
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Soft poll so multi-tab / missed realtime still converges
  useEffect(() => {
    if (!usingSupabase) return;
    const id = window.setInterval(() => {
      void refresh().then(() => setLastSynced(Date.now()));
    }, 15000);
    return () => window.clearInterval(id);
  }, [usingSupabase, refresh]);

  useEffect(() => {
    if (!loading) setLastSynced(Date.now());
  }, [loading, tickets, agents]);

  const metrics = useMemo(() => {
    const openStatuses = new Set(['new', 'open', 'pending', 'on-hold']);
    const openTickets = tickets.filter((t) => openStatuses.has(t.status));
    const waiting = tickets.filter((t) => t.status === 'new' || (t.status === 'open' && !t.first_response_at));

    // Avg wait = mean age of tickets still waiting for first agent response (fallback: all open)
    const waitPool = waiting.length > 0 ? waiting : openTickets;
    let avgWaitMs = 0;
    if (waitPool.length > 0) {
      const sum = waitPool.reduce((acc, t) => {
        const created = new Date(t.created_at).getTime();
        return acc + Math.max(0, now - created);
      }, 0);
      avgWaitMs = sum / waitPool.length;
    }

    const agentsOnline = agents.filter((a) => a.status === 'online' || a.status === 'busy').length;
    const agentsAway = agents.filter((a) => a.status === 'away').length;

    // SLA: share of open tickets still within sla_due_at (or priority heuristic if no due date)
    let withinSla = 0;
    let withSlaTracked = 0;
    for (const t of openTickets) {
      if (t.sla_due_at) {
        withSlaTracked += 1;
        if (new Date(t.sla_due_at).getTime() >= now) withinSla += 1;
      } else {
        // Fallback heuristic by priority age
        const ageH = (now - new Date(t.created_at).getTime()) / 3600000;
        const limit =
          t.priority === 'critical' ? 2 : t.priority === 'high' ? 8 : t.priority === 'medium' ? 24 : 72;
        withSlaTracked += 1;
        if (ageH <= limit) withinSla += 1;
      }
    }
    const slaHealth =
      openTickets.length === 0
        ? 100
        : Math.round((withinSla / Math.max(withSlaTracked, 1)) * 100);

    const breached = openTickets.filter((t) => {
      if (t.sla_due_at) return new Date(t.sla_due_at).getTime() < now;
      return t.priority === 'critical' && t.status !== 'resolved';
    }).length;

    const resolvedToday = tickets.filter((t) => {
      if (t.status !== 'resolved') return false;
      const updated = new Date(t.updated_at || t.created_at).getTime();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return updated >= start.getTime();
    }).length;

    const secondsSinceSync = Math.max(0, Math.floor((now - lastSynced) / 1000));
    const liveLabel =
      usingSupabase
        ? secondsSinceSync < 5
          ? 'Live · synced'
          : `Synced ${secondsSinceSync}s ago`
        : 'Local · live updates';

    return {
      openQueue: openTickets.length,
      avgWaitMs,
      agentsOnline,
      agentsAway,
      agentsTotal: agents.length,
      slaHealth,
      breached,
      resolvedToday,
      liveLabel,
      isHealthy: slaHealth >= 90 && breached === 0,
    };
  }, [tickets, agents, now, lastSynced, usingSupabase]);

  const slaColor =
    metrics.slaHealth >= 90
      ? 'text-emerald-400'
      : metrics.slaHealth >= 75
        ? 'text-amber-400'
        : 'text-rose-400';

  return (
    <div className="bg-gradient-to-r from-zinc-950 via-brand-950 to-zinc-900 text-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-6 lg:gap-8 shadow-lg border border-white/5">
      <div className="flex items-center gap-3 min-w-[150px]">
        <div className="relative">
          <div className={`w-2.5 h-2.5 rounded-full ${metrics.isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${metrics.isHealthy ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping opacity-40`} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Ops live</div>
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Radio size={12} />
            {metrics.liveLabel}
          </div>
        </div>
        {usingSupabase && (
          <button
            type="button"
            title="Refresh now"
            onClick={() => void refresh().then(() => setLastSynced(Date.now()))}
            className="ml-1 p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Open queue</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{metrics.openQueue}</span>
          <Activity size={16} className="text-brand-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[110px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Avg wait</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{formatDuration(metrics.avgWaitMs)}</span>
          <Clock size={16} className="text-amber-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">Agents online</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{metrics.agentsOnline}</span>
          <Users size={16} className="text-emerald-400 mb-1" />
        </div>
        {metrics.agentsAway > 0 && (
          <div className="text-[10px] text-zinc-500">{metrics.agentsAway} away</div>
        )}
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      <div className="flex flex-col min-w-[110px]">
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">SLA score</div>
        <div className="flex items-end gap-2">
          <span className={`text-2xl font-bold tabular-nums ${slaColor}`}>{metrics.slaHealth}%</span>
          <Shield size={16} className={`${slaColor} mb-1`} />
        </div>
        {metrics.breached > 0 && (
          <div className="text-[10px] text-rose-400">{metrics.breached} breached</div>
        )}
      </div>

      <div className="ml-auto text-right hidden lg:block">
        <div className="text-[11px] text-zinc-400">Roster</div>
        <div className="text-sm font-medium">{metrics.agentsTotal} agents</div>
        <div className="text-[10px] text-zinc-500">{metrics.resolvedToday} resolved today</div>
      </div>
    </div>
  );
}
