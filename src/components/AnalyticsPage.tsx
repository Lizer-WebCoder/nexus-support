import { useMemo } from 'react';
import { useTickets } from '../context/TicketContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import ChartTooltip from './ChartTooltip';

const COLORS = ['#4f46e5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
  const { tickets } = useTickets();

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      map[t.status] = (map[t.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const byPriority = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      map[t.priority] = (map[t.priority] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const byChannel = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => {
      map[t.channel] = (map[t.channel] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const open = tickets.filter((t) => t.status !== 'resolved').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const resolutionRate = tickets.length ? Math.round((resolved / tickets.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total tickets', value: String(tickets.length), color: 'text-slate-900' },
          { label: 'Open', value: String(open), color: 'text-amber-600' },
          { label: 'Resolved', value: String(resolved), color: 'text-emerald-600' },
          { label: 'Resolution rate', value: `${resolutionRate}%`, color: 'text-brand-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-xs text-slate-500 uppercase tracking-wide">{m.label}</div>
            <div className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By status</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By priority</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPriority} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {byPriority.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By channel</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
