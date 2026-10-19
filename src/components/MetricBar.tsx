import { Activity, Clock, Users, Shield, Wifi } from 'lucide-react';
import { metrics } from '../data';

export default function MetricBar() {
  return (
    <div className="bg-slate-900 text-white rounded-xl px-5 py-4 flex flex-wrap items-center gap-6 lg:gap-8 shadow-lg">
      {/* Live Status */}
      <div className="flex items-center gap-3 min-w-[140px]">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-wide">Support Live</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Wifi size={12} />
            {metrics.uptime}% uptime
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      {/* Active Conversations */}
      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Open Chats
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{metrics.activeConversations}</span>
          <Activity size={16} className="text-sky-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      {/* Queue Wait */}
      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Avg Wait
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{metrics.queueWait}</span>
          <Clock size={16} className="text-amber-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      {/* Agents Online */}
      <div className="flex flex-col min-w-[100px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          Agents Online
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums">{metrics.agentsOnline}</span>
          <Users size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="h-8 w-px bg-slate-700 hidden sm:block" />

      {/* SLA Health */}
      <div className="flex flex-col min-w-[110px]">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
          SLA Score
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold tabular-nums text-emerald-400">{metrics.slaHealth}%</span>
          <Shield size={16} className="text-emerald-400 mb-1" />
        </div>
      </div>

      <div className="ml-auto text-right hidden lg:block">
        <div className="text-[11px] text-slate-400">Day Shift</div>
        <div className="text-sm font-medium">{metrics.dayShiftAgents} agents</div>
      </div>
    </div>
  );
}
