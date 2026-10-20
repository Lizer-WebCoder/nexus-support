import { useTickets } from '../context/TicketContext';

export default function Distribution() {
  const { tickets } = useTickets();

  const counts = {
    critical: tickets.filter((t) => t.priority === 'critical' && t.status !== 'resolved').length,
    high: tickets.filter((t) => t.priority === 'high' && t.status !== 'resolved').length,
    medium: tickets.filter((t) => t.priority === 'medium' && t.status !== 'resolved').length,
    low: tickets.filter((t) => t.priority === 'low' && t.status !== 'resolved').length,
    onHold: tickets.filter((t) => t.status === 'on-hold').length,
    unassigned: tickets.filter((t) => !t.assignee_id && t.status !== 'resolved').length,
  };

  const items = [
    { label: 'Critical', value: counts.critical, color: 'bg-rose-50 text-rose-700 border-rose-100' },
    { label: 'High', value: counts.high, color: 'bg-orange-50 text-orange-700 border-orange-100' },
    { label: 'Medium', value: counts.medium, color: 'bg-brand-50 text-brand-700 border-brand-100' },
    { label: 'Low', value: counts.low, color: 'bg-zinc-50 text-zinc-600 border-zinc-200' },
    { label: 'On Hold', value: counts.onHold, color: 'bg-violet-50 text-violet-700 border-violet-100' },
    { label: 'Unassigned', value: counts.unassigned, color: 'bg-amber-50 text-amber-800 border-amber-100' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-card p-5">
      <h2 className="text-sm font-semibold text-zinc-800 mb-4">Ticket distribution</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl border px-3 py-3 text-center ${item.color}`}>
            <div className="text-2xl font-bold tabular-nums tracking-tight">{item.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
