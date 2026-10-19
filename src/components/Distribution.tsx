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
    { label: 'Critical', value: counts.critical, color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { label: 'High', value: counts.high, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { label: 'Medium', value: counts.medium, color: 'bg-sky-100 text-sky-700 border-sky-200' },
    { label: 'Low', value: counts.low, color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { label: 'On Hold', value: counts.onHold, color: 'bg-violet-100 text-violet-700 border-violet-200' },
    { label: 'Unassigned', value: counts.unassigned, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Ticket Distribution</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className={`rounded-lg border px-3 py-3 text-center ${item.color}`}>
            <div className="text-2xl font-bold tabular-nums">{item.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
