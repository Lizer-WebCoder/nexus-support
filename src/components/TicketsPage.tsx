import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useTickets } from '../context/TicketContext';
import type { Priority, Status } from '../types';
import CreateTicketModal from './CreateTicketModal';
import TicketDetail from './TicketDetail';

const priorityStyles: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-sky-100 text-sky-700',
  low: 'bg-slate-100 text-slate-600',
};

const statusStyles: Record<string, string> = {
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-violet-50 text-violet-700 border-violet-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'on-hold': 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function TicketsPage() {
  const { tickets, loading } = useTickets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !t.customer_name.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const selected = selectedId ? tickets.find((t) => t.id === selectedId) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="on-hold">On Hold</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No tickets match your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className="border-b border-slate-100 hover:bg-sky-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs truncate">{t.title}</td>
                  <td className="px-4 py-3 text-slate-600">{t.customer_name}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', priorityStyles[t.priority])}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded border capitalize', statusStyles[t.status])}>
                      {t.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{t.channel}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {t.assignee ? t.assignee.initials : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Showing {filtered.length} of {tickets.length} tickets
      </div>

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
      {selected && <TicketDetail ticket={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
