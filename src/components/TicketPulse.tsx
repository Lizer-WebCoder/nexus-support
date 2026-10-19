import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { pulseData } from '../data';
import { useTickets } from '../context/TicketContext';

export default function TicketPulse() {
  const { tickets } = useTickets();

  const statusCards = [
    { label: 'New', value: tickets.filter((t) => t.status === 'new').length, color: 'bg-sky-50 text-sky-700 border-sky-100' },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'open').length, color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { label: 'Pending', value: tickets.filter((t) => t.status === 'pending').length, color: 'bg-violet-50 text-violet-700 border-violet-100' },
    { label: 'Resolved Today', value: tickets.filter((t) => t.status === 'resolved').length, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Breached SLAs', value: tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length, color: 'bg-rose-50 text-rose-700 border-rose-100' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-sky-500">↗</span> Ticket Activity — Last 24 Hours
        </h2>
      </div>
      <div className="h-36 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pulseData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area type="monotone" dataKey="tickets" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#colorTickets)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statusCards.map((card) => (
          <div key={card.label} className={`rounded-lg border px-3 py-2.5 text-center ${card.color}`}>
            <div className="text-xl font-bold tabular-nums">{card.value}</div>
            <div className="text-[11px] font-medium mt-0.5 opacity-80">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
