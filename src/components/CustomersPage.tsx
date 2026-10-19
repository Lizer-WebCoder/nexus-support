import { useMemo, useState } from 'react';
import {
  Search, Building2, Mail, Users, X, Ticket as TicketIcon, UserPlus,
  Pencil, Trash2, Check,
} from 'lucide-react';
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
  const { tickets, updateTicket } = useTickets();
  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<Branch[]>(loadBranches);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Staff');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchEmail, setNewBranchEmail] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberEmail, setEditMemberEmail] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');

  // Only show managed branches + ticket branches that match a known branch or have explicit branch field
  const knownNames = useMemo(() => {
    const s = new Set(branches.map((b) => b.name.toUpperCase()));
    return s;
  }, [branches]);

  const allBranches = useMemo(() => {
    const map = new Map<string, Branch>();
    branches.forEach((b) => map.set(b.name.toUpperCase(), { ...b, members: b.members || [] }));
    tickets.forEach((t) => {
      if (!t.branch?.trim()) return; // don't invent branches from customer_name
      const name = t.branch.trim();
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
      if (!m.has(key)) return;
      const row = m.get(key)!;
      row.total += 1;
      if (t.status !== 'resolved') row.open += 1;
      row.tickets.push(t);
    });
    // Also count tickets whose branch matches even if ticketBranch falls back
    tickets.forEach((t) => {
      if (t.branch?.trim()) {
        const key = t.branch.trim().toUpperCase();
        if (!m.has(key)) return;
        // already counted via ticketBranch if branch set
      }
    });
    return m;
  }, [tickets, allBranches]);

  // Recount properly
  const statsFixed = useMemo(() => {
    const m = new Map<string, { total: number; open: number; tickets: Ticket[] }>();
    allBranches.forEach((b) => m.set(b.name.toUpperCase(), { total: 0, open: 0, tickets: [] }));
    tickets.forEach((t) => {
      const name = t.branch?.trim() || '';
      if (!name) return;
      const key = name.toUpperCase();
      const row = m.get(key);
      if (!row) return;
      row.total += 1;
      if (t.status !== 'resolved') row.open += 1;
      row.tickets.push(t);
    });
    // Legacy: tickets without branch but customer_name matches a known branch name
    tickets.forEach((t) => {
      if (t.branch?.trim()) return;
      const key = (t.customer_name || '').toUpperCase();
      const row = m.get(key);
      if (!row) return;
      row.total += 1;
      if (t.status !== 'resolved') row.open += 1;
      row.tickets.push(t);
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
      const oa = statsFixed.get(a.name.toUpperCase())?.open || 0;
      const ob = statsFixed.get(b.name.toUpperCase())?.open || 0;
      return ob - oa;
    });

  const selectedBranch = allBranches.find((b) => b.name === selected) || null;
  const selectedStats = selectedBranch ? statsFixed.get(selectedBranch.name.toUpperCase()) : null;

  const persist = (next: Branch[]) => {
    setBranches(next);
    saveBranches(next);
  };

  const ensureInList = (branch: Branch): Branch[] => {
    if (branches.some((b) => b.name.toUpperCase() === branch.name.toUpperCase())) {
      return branches.map((b) =>
        b.name.toUpperCase() === branch.name.toUpperCase() ? { ...branch, id: b.id } : b
      );
    }
    return [...branches, branch];
  };

  const addBranch = () => {
    const name = newBranchName.trim().toUpperCase();
    if (!name) return;
    if (allBranches.some((b) => b.name.toUpperCase() === name)) {
      setSelected(allBranches.find((b) => b.name.toUpperCase() === name)!.name);
      setShowNewBranch(false);
      setNewBranchName('');
      setNewBranchEmail('');
      return;
    }
    const branch: Branch = {
      id: `b-${Date.now()}`,
      name,
      email: newBranchEmail.trim() || undefined,
      members: [],
    };
    persist([...branches, branch]);
    setSelected(name);
    setShowNewBranch(false);
    setNewBranchName('');
    setNewBranchEmail('');
  };

  const startEdit = () => {
    if (!selectedBranch) return;
    setEditName(selectedBranch.name);
    setEditEmail(selectedBranch.email || '');
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedBranch || !editName.trim()) return;
    const newName = editName.trim().toUpperCase();
    const oldName = selectedBranch.name;
    const oldKey = oldName.toUpperCase();

    // Rename conflicts
    if (
      newName !== oldKey &&
      allBranches.some((b) => b.name.toUpperCase() === newName)
    ) {
      alert('A branch with that name already exists.');
      return;
    }

    const updated: Branch = {
      ...selectedBranch,
      name: newName,
      email: editEmail.trim() || undefined,
    };

    let next = ensureInList(updated);
    // If renamed, remove old key entry if it was only under old name
    if (newName !== oldKey) {
      next = next
        .filter((b) => b.name.toUpperCase() !== oldKey)
        .concat(
          next.some((b) => b.name.toUpperCase() === newName)
            ? []
            : [updated]
        );
      // dedupe
      const map = new Map<string, Branch>();
      next.forEach((b) => map.set(b.name.toUpperCase(), b));
      map.set(newName, updated);
      next = Array.from(map.values());

      // Update tickets that pointed at old branch name
      const toUpdate = tickets.filter(
        (t) =>
          (t.branch || '').toUpperCase() === oldKey ||
          (!t.branch && (t.customer_name || '').toUpperCase() === oldKey)
      );
      for (const t of toUpdate) {
        try {
          await updateTicket(t.id, { branch: newName } as Parameters<typeof updateTicket>[1]);
        } catch (e) {
          console.error('Failed to retarget ticket branch', e);
        }
      }
    } else {
      next = ensureInList(updated);
    }

    persist(next);
    setSelected(newName);
    setEditing(false);
  };

  const deleteBranch = () => {
    if (!selectedBranch) return;
    const count = selectedStats?.total || 0;
    const msg =
      count > 0
        ? `Delete "${selectedBranch.name}"? ${count} ticket(s) will keep their data but this branch card will be removed. Tickets stay under the same branch name unless you reassign them.`
        : `Delete branch "${selectedBranch.name}"?`;
    if (!confirm(msg)) return;
    const next = branches.filter(
      (b) => b.name.toUpperCase() !== selectedBranch.name.toUpperCase()
    );
    persist(next);
    setSelected(null);
    setEditing(false);
  };

  const addMember = () => {
    if (!selectedBranch || !newMemberName.trim()) return;
    const member: BranchMember = {
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim() || undefined,
      role: newMemberRole.trim() || 'Staff',
    };
    const base = ensureInList({
      ...selectedBranch,
      members: [...(selectedBranch.members || []), member],
    });
    persist(base);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Staff');
  };

  const removeMember = (memberId: string) => {
    if (!selectedBranch) return;
    const base = ensureInList({
      ...selectedBranch,
      members: (selectedBranch.members || []).filter((m) => m.id !== memberId),
    });
    persist(base);
  };

  const startEditMember = (m: BranchMember) => {
    setEditMemberId(m.id);
    setEditMemberName(m.name);
    setEditMemberEmail(m.email || '');
    setEditMemberRole(m.role || 'Staff');
  };

  const saveEditMember = () => {
    if (!selectedBranch || !editMemberId || !editMemberName.trim()) return;
    const base = ensureInList({
      ...selectedBranch,
      members: (selectedBranch.members || []).map((m) =>
        m.id === editMemberId
          ? {
              ...m,
              name: editMemberName.trim(),
              email: editMemberEmail.trim() || undefined,
              role: editMemberRole.trim() || 'Staff',
            }
          : m
      ),
    });
    persist(base);
    setEditMemberId(null);
  };

  const statusClass: Record<string, string> = {
    new: 'bg-sky-100 text-sky-700',
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-violet-100 text-violet-700',
    'on-hold': 'bg-slate-100 text-slate-600',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  void knownNames; // reserved for future filters
  void stats;

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
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-slate-500">Branch name *</label>
            <input
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="e.g. CIRIAN BRANCH"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
              onKeyDown={(e) => e.key === 'Enter' && addBranch()}
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-slate-500">Contact email</label>
            <input
              value={newBranchEmail}
              onChange={(e) => setNewBranchEmail(e.target.value)}
              placeholder="branch@company.com"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
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
          const s = statsFixed.get(b.name.toUpperCase()) || { total: 0, open: 0, tickets: [] };
          return (
            <button
              key={b.id || b.name}
              type="button"
              onClick={() => {
                setSelected(b.name);
                setEditing(false);
                setEditMemberId(null);
              }}
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
                    {(b.members || []).length} member{(b.members || []).length !== 1 ? 's' : ''}
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
          No branches found. Create one with + Branch.
        </div>
      )}

      {selectedBranch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 z-10">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Branch</div>
                  {editing ? (
                    <div className="mt-1 space-y-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg"
                        placeholder="Branch name"
                      />
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                        placeholder="Contact email"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-slate-900">{selectedBranch.name}</h2>
                      {selectedBranch.email && (
                        <div className="text-xs text-slate-500 mt-0.5">{selectedBranch.email}</div>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={startEdit}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        title="Edit branch"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={deleteBranch}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        title="Delete branch"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button type="button" onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
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
                    <div key={m.id} className="bg-slate-50 rounded-lg px-3 py-2">
                      {editMemberId === m.id ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={editMemberName} onChange={(e) => setEditMemberName(e.target.value)} className="px-2 py-1 text-sm border rounded-lg" placeholder="Name" />
                            <input value={editMemberEmail} onChange={(e) => setEditMemberEmail(e.target.value)} className="px-2 py-1 text-sm border rounded-lg" placeholder="Email" />
                          </div>
                          <div className="flex gap-2">
                            <input value={editMemberRole} onChange={(e) => setEditMemberRole(e.target.value)} className="flex-1 px-2 py-1 text-sm border rounded-lg" placeholder="Role" />
                            <button type="button" onClick={saveEditMember} className="px-2 py-1 text-xs font-medium text-white bg-sky-600 rounded-lg">Save</button>
                            <button type="button" onClick={() => setEditMemberId(null)} className="px-2 py-1 text-xs text-slate-500">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800">{m.name}</div>
                            <div className="text-xs text-slate-500">
                              {m.role || 'Staff'}
                              {m.email ? ` · ${m.email}` : ''}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button type="button" onClick={() => startEditMember(m)} className="text-xs text-slate-400 hover:text-sky-600 px-1">Edit</button>
                            <button type="button" onClick={() => removeMember(m.id)} className="text-xs text-slate-400 hover:text-rose-600 px-1">Remove</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border border-dashed border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <UserPlus size={12} /> Add member
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Name *" className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg" />
                    <input value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} placeholder="Email" className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg" />
                  </div>
                  <div className="flex gap-2">
                    <input value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} placeholder="Role" className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg" />
                    <button type="button" onClick={addMember} disabled={!newMemberName.trim()} className="px-3 py-1.5 text-sm font-medium text-white bg-sky-600 rounded-lg disabled:opacity-40">Add</button>
                  </div>
                </div>
              </div>

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
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusClass[t.status] || 'bg-slate-100'}`}>
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
