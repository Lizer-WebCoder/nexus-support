import { useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import ChartTooltip from './ChartTooltip';
import { Ticket, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

const STATUS_ORDER = ['new', 'open', 'pending', 'on-hold', 'resolved'];
const STATUS_COLORS: Record<string, string> = {
  new: '#8b5cf6',
  open: '#6366f1',
  pending: '#a78bfa',
  'on-hold': '#c4b5fd',
  resolved: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#e11d48',
  high: '#f59e0b',
  medium: '#8b5cf6',
  low: '#a5b4fc',
};

const CHANNEL_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#6366f1', '#4f46e5'];

function emptyChart(label: string) {
  return (
    <div className="h-full flex items-center justify-center text-sm text-slate-400">
      No {label} data yet
    </div>
  );
}

export default function AnalyticsPage() {
  const { tickets } = useTickets();
  const live = tickets.filter((t) => !t.deleted_at);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    STATUS_ORDER.forEach((s) => {
      map[s] = 0;
    });
    live.forEach((t) => {
      map[t.status] = (map[t.status] || 0) + 1;
    });
    return STATUS_ORDER.map((name) => ({
      name: name.replace('-', ' '),
      value: map[name] || 0,
      fill: STATUS_COLORS[name] || '#8b5cf6',
    })).filter((d) => d.value > 0 || live.length === 0);
  }, [live]);

  const byPriority = useMemo(() => {
    const order = ['urgent', 'high', 'medium', 'low'];
    const map: Record<string, number> = {};
    live.forEach((t) => {
      map[t.priority] = (map[t.priority] || 0) + 1;
    });
    return order
      .filter((p) => map[p])
      .map((name) => ({
        name,
        value: map[name],
        fill: PRIORITY_COLORS[name] || '#8b5cf6',
      }));
  }, [live]);

  const byChannel = useMemo(() => {
    const map: Record<string, number> = {};
    live.forEach((t) => {
      map[t.channel] = (map[t.channel] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        fill: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
      }));
  }, [live]);

  const open = live.filter((t) => t.status !== 'resolved').length;
  const resolved = live.filter((t) => t.status === 'resolved').length;
  const resolutionRate = live.length ? Math.round((resolved / live.length) * 100) : 0;

  const metrics = [
    {
      label: 'Total tickets',
      value: String(live.length),
      icon: Ticket,
      tint: 'from-violet-500/15 to-fuchsia-500/10',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Open',
      value: String(open),
      icon: Clock,
      tint: 'from-amber-500/15 to-orange-500/10',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Resolved',
      value: String(resolved),
      icon: CheckCircle2,
      tint: 'from-emerald-500/15 to-teal-500/10',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Resolution rate',
      value: `${resolutionRate}%`,
      icon: TrendingUp,
      tint: 'from-indigo-500/15 to-violet-500/10',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ticket volume, priority mix, and channels</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className={`relative overflow-hidden rounded-2xl border border-violet-100/70 bg-gradient-to-br ${m.tint} p-5 shadow-sm`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{m.label}</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">{m.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-white/80 border border-white flex items-center justify-center ${m.iconColor}`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-violet-100/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">By status</h3>
            <span className="text-[11px] text-slate-400">{live.length} tickets</span>
          </div>
          <div className="h-64 mt-2">
            {byStatus.every((d) => d.value === 0) ? (
              emptyChart('status')
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                    {byStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-violet-100/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">By priority</h3>
          </div>
          <div className="h-64 mt-2">
            {byPriority.length === 0 ? (
              emptyChart('priority')
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {byPriority.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={28}
                    formatter={(value) => <span className="text-xs text-slate-600 capitalize">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-violet-100/80 shadow-sm p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-800">By channel</h3>
          </div>
          <div className="h-64 mt-2">
            {byChannel.length === 0 ? (
              emptyChart('channel')
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byChannel} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    {byChannel.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
