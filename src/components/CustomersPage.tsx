import { useMemo, useState } from 'react';
import { Search, Building2, Mail } from 'lucide-react';
import { useTickets } from '../context/TicketContext';

export default function CustomersPage() {
  const { tickets, customers } = useTickets();
  const [search, setSearch] = useState('');

  const derived = useMemo(() => {
    const map = new Map<string, { name: string; email?: string; ticketCount: number; openCount: number }>();
    customers.forEach((c) => {
      map.set(c.name, { name: c.name, email: c.email, ticketCount: 0, openCount: 0 });
    });
    tickets.forEach((t) => {
      const existing = map.get(t.customer_name) || { name: t.customer_name, ticketCount: 0, openCount: 0 };
      existing.ticketCount += 1;
      if (t.status !== 'resolved') existing.openCount += 1;
      map.set(t.customer_name, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.openCount - a.openCount);
  }, [tickets, customers]);

  const filtered = derived.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
        </div>
        <div className="text-sm text-slate-500">{filtered.length} customers</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-sky-200 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                <Building2 size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900 truncate">{c.name}</div>
                {c.email && (
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail size={12} />{c.email}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <div className="text-lg font-bold text-slate-800 tabular-nums">{c.ticketCount}</div>
                <div className="text-[11px] text-slate-500">Total tickets</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600 tabular-nums">{c.openCount}</div>
                <div className="text-[11px] text-slate-500">Open</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No customers found</div>
      )}
    </div>
  );
}
