import { useMemo, useState } from 'react';
import { Search, Building2, Mail, Users, X, Ticket as TicketIcon, UserPlus } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { INITIAL_BRANCHES } from '../data';
import { ticketBranch } from '../types';
import type { Ticket, Branch, BranchMember } from '../types';

const BRANCH_LS = 'nexus-branches-v1';

function loadBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(BRANCH_LS);
    if (raw) return JSON.parse(raw) as Branch[];
  } catch {}
  return INITIAL_BRANCHES;
}

function saveBranches(list: Branch[]) {
  try {
    localStorage.setItem(BRANCH_LS, JSON.stringify(list));
  } catch {}
}

export default function CustomersPage() {
  const { tickets } = useTickets();
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<Branch[]>(loadBranches);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Staff');
  const [newBranchName, setNewBranchName] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);

  // Merge any branch names seen on tickets into the list
  const allBranches = useMemo(() => {
    const map = new Map<string, Branch>();
    branches.forEach((b) => map.set(b.name.toUpperCase(), b));
    tickets.forEach((t) => {
      const name = ticketBranch(t);
      const key = name.toUpperCase();
      if (!map.has(key)) {
        map.set(key, { id: `auto-${key}`, name, members: [] });
      }
    });
    return Array.from(map.values());
  }, [branches, tickets]);

  const stats = useMemo(() => {
    const m = new Map<string, { total: number; open: number; tickets: Ticket[] }>();
    allBranches.forEach((b) => m.set(b.name.toUpperCase(), { total: 0, open: 0, tickets: [] }));
    tickets.forEach((t) => {
      const key = ticketBranch(t).toUpperCase();
      const row = m.get(key) || { total: 0, open: 0, tickets: [] };
      row.total += 1;
      if (t.status !== 'resolved') row.open += 1;
      row.tickets.push(t);
      m.set(key, row);
    });
    return m;
  }, [tickets, allBranches]);

  const filtered = allBranches
    .filter(
      (b) =>
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.email || '').toLowerCase().includes(search.toLowerCase()) ||
        b.members.some((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const oa = stats.get(a.name.toUpperCase())?.open || 0;
      const ob = stats.get(b.name.toUpperCase())?.open || 0;
      return ob - oa;
    });

  const selectedBranch = allBranches.find((b) => b.name === selected) || null;
  const selectedStats = selectedBranch ? stats.get(selectedBranch.name.toUpperCase()) : null;

  const persist = (next: Branch[]) => {
    setBranches(next);
    saveBranches(next);
  };

  const addBranch = () => {
    const name = newBranchName.trim().toUpperCase();
    if (!name) return;
    if (allBranches.some((b) => b.name.toUpperCase() === name)) {
      setSelected(allBranches.find((b) => b.name.toUpperCase() === name)!.name);
      setShowNewBranch(false);
      setNewBranchName('');
      return;
    }
    const branch: Branch = { id: `b-${Date.now()}`, name, members: [] };
    persist([...branches, branch]);
    setSelected(name);
    setShowNewBranch(false);
    setNewBranchName('');
  };

  const addMember = () => {
    if (!selectedBranch || !newMemberName.trim()) return;
    const member: BranchMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
      role: newMemberRole.trim() || 'Staff',
    };
    const next = branches.some((b) => b.name === selectedBranch.name)
      ? branches.map((b) =>
          b.name === selectedBranch.name ? { ...b, members: [...b.members, member] } : b
        )
      : [...branches, { ...selectedBranch, members: [...selectedBranch.members, member] }];
    persist(next);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Staff');
  };

  const removeMember = (memberId: string) => {
    if (!selectedBranch) return;
    const next = branches.map((b) =>
      b.name === selectedBranch.name
        ? { ...b, members: b.members.filter((m) => m.id !== memberId) }
        : b
    );
    persist(next);
  };

  const statusClass: Record<string, string> = {
    new: 'bg-sky-100 text-sky-700',
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-violet-100 text-violet-700',
    'on-hold': 'bg-slate-100 text-slate-600',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches or members…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">{filtered.length} branches</div>
          <button
            type="button"
            onClick={() => setShowNewBranch((v) => !v)}
            className="px-3 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
          >
            + Branch
          </button>
        </div>
      </div>

      {showNewBranch && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-2 items-end shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-500">Branch name</label>
            <input
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="e.g. CIRIAN BRANCH"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && addBranch()}
            />
          </div>
          <button type="button" onClick={addBranch} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg">
            Add
          </button>
          <button type="button" onClick={() => setShowNewBranch(false)} className="px-4 py-2 text-sm text-slate-600">
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((b) => {
          const s = stats.get(b.name.toUpperCase()) || { total: 0, open: 0, tickets: [] };
          return (
            <button
              key={b.id || b.name}
              type="button"
              onClick={() => setSelected(b.name)}
              className="text-left bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-sky-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 truncate">{b.name}</div>
                  {b.email && (
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail size={12} />
                      {b.email}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Users size={12} />
                    {b.members.length} member{b.members.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">{s.total}</div>
                  <div className="text-[11px] text-slate-500">Total tickets</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-600 tabular-nums">{s.open}</div>
                  <div className="text-[11px] text-slate-500">Open</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No branches found
        </div>
      )}

      {/* Branch detail drawer */}
      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Branch</div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedBranch.name}</h2>
                {selectedBranch.email && (
                  <div className="text-xs text-slate-500 mt-0.5">{selectedBranch.email}</div>
                )}
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-slate-900">{selectedStats?.total || 0}</div>
                  <div className="text-xs text-slate-500">Total tickets</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="text-2xl font-bold text-amber-600">{selectedStats?.open || 0}</div>
                  <div className="text-xs text-slate-500">Open</div>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800">Members</h3>
                </div>
                <div className="space-y-2 mb-3">
                  {(selectedBranch.members || []).length === 0 && (
                    <p className="text-xs text-slate-400">No members yet. Add people who work at this branch.</p>
                  )}
                  {(selectedBranch.members || []).map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800">{m.name}</div>
                        <div className="text-xs text-slate-500">
                          {m.role || 'Staff'}
                          {m.email ? ` · ${m.email}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(m.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <UserPlus size={12} /> Add member
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Name *"
                      className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                    <input
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Email"
                      className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      placeholder="Role"
                      className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={addMember}
                      disabled={!newMemberName.trim()}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-lg disabled:opacity-40"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Tickets for this branch */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TicketIcon size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    Tickets ({selectedStats?.tickets.length || 0})
                  </h3>
                </div>
                <div className="space-y-2">
                  {(selectedStats?.tickets || []).length === 0 && (
                    <p className="text-xs text-slate-400">No tickets for this branch yet.</p>
                  )}
                  {(selectedStats?.tickets || [])
                    .slice()
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((t) => (
                      <div key={t.id} className="border border-slate-200 rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] text-slate-400">{t.id}</span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                              statusClass[t.status] || 'bg-slate-100'
                            }`}
                          >
                            {t.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 mt-1">{t.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {t.customer_name}
                          {t.customer_email ? ` · ${t.customer_email}` : ''} ·{' '}
                          {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
