import { prioritySummary } from '../data';

const items = [
  { label: 'Critical', value: prioritySummary.critical, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: 'High', value: prioritySummary.high, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Medium', value: prioritySummary.medium, color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { label: 'Low', value: prioritySummary.low, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { label: 'On Hold', value: prioritySummary.onHold, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { label: 'Unassigned', value: prioritySummary.unassigned, color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export default function Distribution() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">Ticket Distribution</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-lg border px-3 py-3 text-center ${item.color}`}
          >
            <div className="text-2xl font-bold tabular-nums">{item.value}</div>
            <div className="text-xs font-medium mt-1 opacity-80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
