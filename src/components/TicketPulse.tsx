import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTickets } from '../context/TicketContext';
import ChartTooltip from './ChartTooltip';
import { TrendingUp } from 'lucide-react';

/** Build 12 × 2-hour buckets for the last 24 hours from real ticket created_at. */
function buildPulse(tickets: { created_at: string }[]) {
  const now = Date.now();
  const bucketMs = 2 * 60 * 60 * 1000;
  const buckets: { time: string; tickets: number; start: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const start = now - (i + 1) * bucketMs;
    const end = now - i * bucketMs;
    const labelDate = new Date(end);
    const hh = String(labelDate.getHours()).padStart(2, '0');
    const mm = String(labelDate.getMinutes()).padStart(2, '0');
    buckets.push({ time: `${hh}:${mm}`, tickets: 0, start });
  }

  for (const t of tickets) {
    const ts = new Date(t.created_at).getTime();
    if (Number.isNaN(ts)) continue;
    if (ts < now - 24 * 60 * 60 * 1000 || ts > now) continue;
    for (let i = 0; i < buckets.length; i++) {
      const bStart = buckets[i].start;
      const bEnd = bStart + bucketMs;
      if (ts >= bStart && ts < bEnd) {
        buckets[i].tickets += 1;
        break;
      }
    }
  }

  return buckets.map(({ time, tickets }) => ({ time, tickets }));
}

function isSameLocalDay(iso: string | undefined, ref = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default function TicketPulse() {
  const { tickets } = useTickets();

  const pulseData = useMemo(() => buildPulse(tickets), [tickets]);
  const totalLast24 = useMemo(
    () => pulseData.reduce((s, b) => s + b.tickets, 0),
    [pulseData]
  );

  const now = Date.now();
  const statusCards = useMemo(() => {
    const active = tickets.filter((t) => !t.deleted_at);
    return [
      {
        label: 'New',
        value: active.filter((t) => t.status === 'new').length,
        color: 'bg-brand-50 text-brand-700 border-brand-100',
      },
      {
        label: 'In Progress',
        value: active.filter((t) => t.status === 'open').length,
        color: 'bg-amber-50 text-amber-800 border-amber-100',
      },
      {
        label: 'Pending',
        value: active.filter((t) => t.status === 'pending').length,
        color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
      },
      {
        label: 'Resolved Today',
        value: active.filter(
          (t) =>
            t.status === 'resolved' &&
            isSameLocalDay(t.updated_at || t.created_at)
        ).length,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      },
      {
        label: 'Breached SLAs',
        value: active.filter(
          (t) =>
            t.status !== 'resolved' &&
            t.sla_due_at &&
            new Date(t.sla_due_at).getTime() < now
        ).length,
        color: 'bg-rose-50 text-rose-700 border-rose-100',
      },
    ];
  }, [tickets, now]);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <TrendingUp size={14} />
          </span>
          Ticket activity — last 24 hours
        </h2>
        <span className="text-xs text-zinc-500 tabular-nums">
          {totalLast24} created in window · {tickets.filter((t) => !t.deleted_at).length} open total
        </span>
      </div>
      <div className="h-36 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pulseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              domain={[0, (max: number) => Math.max(3, max + 1)]}
            />
            <Tooltip
              cursor={{ stroke: '#c7d2fe', strokeWidth: 1 }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="tickets"
              name="Created"
              stroke="#4f46e5"
              strokeWidth={2.5}
              fill="url(#colorTickets)"
              activeDot={{ r: 5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusCards.map((card) => (
          <div key={card.label} className={`rounded-xl border px-3 py-2.5 text-center ${card.color}`}>
            <div className="text-xl font-bold tabular-nums tracking-tight">{card.value}</div>
            <div className="text-[11px] font-medium mt-0.5 opacity-80">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
