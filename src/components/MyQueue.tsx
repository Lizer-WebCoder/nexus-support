import { tickets } from '../data';
import clsx from 'clsx';

const priorityStyles: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-sky-100 text-sky-700',
  low: 'bg-slate-100 text-slate-600',
};

const statusStyles: Record<string, string> = {
  new: 'text-sky-600',
  open: 'text-amber-600',
  pending: 'text-violet-600',
  resolved: 'text-emerald-600',
  'on-hold': 'text-slate-500',
};

export default function MyQueue() {
  const myTickets = tickets.filter((t) => t.status !== 'resolved').slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          My Queue
          <span className="bg-sky-100 text-sky-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {myTickets.length}
          </span>
        </h2>
        <button className="text-xs font-medium text-sky-600 hover:text-sky-700">
          View all →
        </button>
      </div>

      <div className="space-y-2">
        {myTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
          >
            <div
              className={clsx(
                'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 shrink-0',
                priorityStyles[ticket.priority]
              )}
            >
              {ticket.priority}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                <span className={clsx('text-xs font-medium capitalize', statusStyles[ticket.status])}>
                  {ticket.status.replace('-', ' ')}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-800 truncate mt-0.5">
                {ticket.title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{ticket.customer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
