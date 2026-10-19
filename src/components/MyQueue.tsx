import { useState } from 'react';
import clsx from 'clsx';
import { useTickets } from '../context/TicketContext';
import TicketDetail from './TicketDetail';

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
  const { tickets } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const myTickets = tickets.filter((t) => t.status !== 'resolved').slice(0, 6);
  const selected = selectedId ? tickets.find((t) => t.id === selectedId) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          My Queue
          <span className="bg-sky-100 text-sky-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {myTickets.length}
          </span>
        </h2>
      </div>

      <div className="space-y-2">
        {myTickets.length === 0 && (
          <p className="text-sm text-slate-500 py-4 text-center">No open tickets</p>
        )}
        {myTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => setSelectedId(ticket.id)}
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
              <div className="text-sm font-medium text-slate-800 truncate mt-0.5">{ticket.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">{ticket.customer_name}</div>
            </div>
          </div>
        ))}
      </div>

      {selected && <TicketDetail ticket={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
