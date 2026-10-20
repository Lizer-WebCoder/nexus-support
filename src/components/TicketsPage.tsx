import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Download, Trash2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { useTickets } from '../context/TicketContext';
import type { Priority, Status } from '../types';
import { formatSlaCountdown } from '../lib/slaFormat';
import CreateTicketModal from './CreateTicketModal';
import TicketDetail from './TicketDetail';

const priorityStyles: Record<string, string> = {
  critical: 'bg-rose-100 text-rose-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-brand-100 text-brand-700',
  low: 'bg-slate-100 text-slate-600',
};

const statusStyles: Record<string, string> = {
  new: 'bg-brand-50 text-brand-700 border-brand-200',
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-violet-50 text-violet-700 border-violet-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'on-hold': 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function TicketsPage() {
  const { tickets, loading, updateTicket, deleteTicket } = useTickets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showTrash, setShowTrash] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // Refresh SLA countdown every 30s
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const isDeleted = !!t.deleted_at;
      if (showTrash ? !isDeleted : isDeleted) return false;
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
  }, [tickets, search, statusFilter, priorityFilter, showTrash]);

  const selected = selectedId ? tickets.find((t) => t.id === selectedId) : null;
  const trashCount = tickets.filter((t) => t.deleted_at).length;

  const softDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Move this ticket to trash?')) return;
    await updateTicket(id, { deleted_at: new Date().toISOString() } as never);
  };

  const restore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateTicket(id, { deleted_at: null } as never);
  };

  const hardDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this ticket?')) return;
    await deleteTicket(id);
  };

  const exportCsv = () => {
    const headers = ['ID', 'Title', 'Customer', 'Email', 'Priority', 'Status', 'Channel', 'Assignee', 'SLA due', 'Created'];
    const rows = filtered.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.customer_name.replace(/"/g, '""')}"`,
      t.customer_email || '',
      t.priority,
      t.status,
      t.channel,
      t.assignee?.name || '',
      t.sla_due_at || '',
      t.created_at,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All statuses</option>
            {(['new', 'open', 'pending', 'resolved', 'on-hold'] as Status[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | 'all')}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All priorities</option>
            {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowTrash((v) => !v)}
            className={clsx(
              'text-sm px-3 py-2 rounded-lg border',
              showTrash ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'
            )}
          >
            Trash{trashCount ? ` (${trashCount})` : ''}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <Download size={16} /> Export
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
          >
            <Plus size={16} /> New ticket
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {showTrash ? 'Trash is empty.' : 'No tickets match your filters.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">SLA</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const sla = formatSlaCountdown(t.sla_due_at, t.status);
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className="border-b border-slate-100 hover:bg-brand-50/50 cursor-pointer transition-colors"
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
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-xs font-semibold tabular-nums px-2 py-0.5 rounded',
                          sla.tone === 'breach' && 'bg-rose-100 text-rose-700',
                          sla.tone === 'warn' && 'bg-amber-100 text-amber-800',
                          sla.tone === 'ok' && 'bg-emerald-50 text-emerald-700',
                          sla.tone === 'done' && 'text-slate-400'
                        )}
                        title={t.sla_due_at ? new Date(t.sla_due_at).toLocaleString() : 'No SLA'}
                      >
                        {sla.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-600">{t.channel}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.assignee ? t.assignee.initials : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {showTrash ? (
                        <div className="flex gap-1">
                          <button type="button" title="Restore" onClick={(e) => void restore(t.id, e)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                            <RotateCcw size={14} />
                          </button>
                          <button type="button" title="Delete forever" onClick={(e) => void hardDelete(t.id, e)} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" title="Move to trash" onClick={(e) => void softDelete(t.id, e)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Showing {filtered.length} of {tickets.filter((t) => (showTrash ? t.deleted_at : !t.deleted_at)).length} tickets
        {showTrash ? ' in trash' : ''}
      </div>

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
      {selected && !selected.deleted_at && <TicketDetail ticket={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
