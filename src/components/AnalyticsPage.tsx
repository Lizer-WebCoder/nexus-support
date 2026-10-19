import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTickets } from '../context/TicketContext';

const COLORS = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#f97316'];

export default function AnalyticsPage() {
  const { tickets, agents } = useTickets();

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => { map[t.status] = (map[t.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name.replace('-', ' '),
      value,
    }));
  }, [tickets]);

  const byPriority = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => { map[t.priority] = (map[t.priority] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const byChannel = useMemo(() => {
    const map: Record<string, number> = {};
    tickets.forEach((t) => { map[t.channel] = (map[t.channel] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({
      name: name === 'chat' ? 'Live Chat' : name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [tickets]);

  const byAgent = useMemo(() => {
    return agents.map((a) => ({
      name: a.initials,
      open: tickets.filter((t) => t.assignee_id === a.id && t.status !== 'resolved').length,
      resolved: tickets.filter((t) => t.assignee_id === a.id && t.status === 'resolved').length,
    }));
  }, [tickets, agents]);

  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const open = tickets.filter((t) => t.status !== 'resolved').length;
  const critical = tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length;
  const resolutionRate = tickets.length ? Math.round((resolved / tickets.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total tickets', value: tickets.length, color: 'text-slate-900' },
          { label: 'Open', value: open, color: 'text-amber-600' },
          { label: 'Resolved', value: resolved, color: 'text-emerald-600' },
          { label: 'Resolution rate', value: `${resolutionRate}%`, color: 'text-sky-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {critical > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
          <strong>{critical}</strong> critical ticket{critical > 1 ? 's' : ''} still open — prioritize these first.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By status</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By priority</h3>
          <div className="h-48 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={byPriority} dataKey="value" cx="50%" cy="50%" outerRadius={70} stroke="none">
                  {byPriority.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {byPriority.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 capitalize flex-1">{item.name}</span>
                  <span className="font-semibold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">By channel</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byChannel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Workload by agent</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgent}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }} />
                <Bar dataKey="open" name="Open" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
