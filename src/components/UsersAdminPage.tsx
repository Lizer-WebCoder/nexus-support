import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Shield,
  UserRound,
  Building2,
  KeyRound,
  Save,
  RefreshCw,
  Check,
  X,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';
import { useTickets } from '../context/TicketContext';
import { supabase } from '../lib/supabase';
import type { Agent, Customer, Branch } from '../types';
import { INITIAL_BRANCHES } from '../data';
import AgentAvatar from './AgentAvatar';

const BRANCH_LS = 'nexus-branches-v1';

function loadBranchNames(): string[] {
  try {
    const raw = localStorage.getItem(BRANCH_LS);
    if (raw) {
      const list = JSON.parse(raw) as Branch[];
      return list.map((b) => b.name).filter(Boolean);
    }
  } catch {}
  return INITIAL_BRANCHES.map((b) => b.name);
}

type UserKind = 'agent' | 'customer';

interface UnifiedUser {
  key: string;
  kind: UserKind;
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: boolean;
  branch: string;
  status?: string | null;
  agent?: Agent;
  customer?: Customer;
}

export default function UsersAdminPage() {
  const { agents, customers, currentAgent, setAgentAdmin, refresh, usingSupabase } = useTickets();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'agent' | 'customer' | 'admin' | 'pending'>('all');
  const [branchNames, setBranchNames] = useState<string[]>(loadBranchNames);
  const [editing, setEditing] = useState<UnifiedUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editAdmin, setEditAdmin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  useEffect(() => {
    setBranchNames(loadBranchNames());
  }, []);

  const rows: UnifiedUser[] = useMemo(() => {
    const agentRows: UnifiedUser[] = agents.map((a) => ({
      key: `agent-${a.id}`,
      kind: 'agent' as const,
      id: a.id,
      name: a.name,
      email: a.email || '',
      role: a.is_admin ? 'Admin' : a.role || 'Agent',
      is_admin: !!a.is_admin,
      branch: a.branch || '',
      agent: a,
    }));
    const branchNameSet = new Set(branchNames.map((b) => b.trim().toUpperCase()));
    const customerRows: UnifiedUser[] = customers
      .filter((c) => {
        const n = (c.name || '').trim().toUpperCase();
        if (n.endsWith(' BRANCH')) return false;
        if (branchNameSet.has(n)) return false;
        return true;
      })
      .map((c) => ({
        key: `customer-${c.id}`,
        kind: 'customer' as const,
        id: c.id,
        name: c.name,
        email: c.email || '',
        role: c.role || 'Customer',
        is_admin: false,
        branch: c.branch || '',
        status: c.status || 'approved',
        customer: c,
      }));
    return [...agentRows, ...customerRows].sort((a, b) => {
      const ap = a.status === 'pending' ? 0 : 1;
      const bp = b.status === 'pending' ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.name.localeCompare(b.name);
    });
  }, [agents, customers, branchNames]);

  const pendingCount = rows.filter((r) => r.status === 'pending').length;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === 'agent' && r.kind !== 'agent') return false;
      if (filter === 'customer' && r.kind !== 'customer') return false;
      if (filter === 'admin' && !r.is_admin) return false;
      if (filter === 'pending' && r.status !== 'pending') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.email.toLowerCase().includes(q) &&
          !r.role.toLowerCase().includes(q) &&
          !r.branch.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rows, filter, search]);

  const setCustomerStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setActionBusy(id);
    setMsg('');
    setErr('');
    try {
      if (!supabase) throw new Error('Supabase required');
      const { error } = await supabase.from('customers').update({ status }).eq('id', id);
      if (error) {
        if (String(error.message).toLowerCase().includes('status')) {
          throw new Error(
            "Add column: alter table public.customers add column if not exists status text default 'approved';"
          );
        }
        throw error;
      }
      setMsg(
        status === 'approved'
          ? 'Customer approved — they can use the portal.'
          : status === 'rejected'
            ? 'Customer rejected.'
            : 'Set back to pending.'
      );
      await refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not update status');
    } finally {
      setActionBusy(null);
    }
  };

  const openEdit = (u: UnifiedUser) => {
    setEditing(u);
    setEditName(u.name);
    setEditRole(u.is_admin ? 'Admin' : u.role);
    setEditBranch(u.branch);
    setEditAdmin(u.is_admin);
    setMsg('');
    setErr('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    setMsg('');
    setErr('');
    try {
      if (editing.kind === 'agent') {
        const roleLabel = editAdmin ? 'Admin' : editRole.trim() || 'Agent';
        if (supabase) {
          const payload: Record<string, unknown> = {
            name: editName.trim(),
            role: roleLabel,
            is_admin: editAdmin,
            branch: editBranch.trim() || null,
          };
          const { error } = await supabase.from('agents').update(payload).eq('id', editing.id);
          if (error) {
            if (String(error.message).toLowerCase().includes('branch')) {
              const { error: e2 } = await supabase
                .from('agents')
                .update({ name: editName.trim(), role: roleLabel, is_admin: editAdmin })
                .eq('id', editing.id);
              if (e2) throw e2;
            } else throw error;
          }
        }
        if (editAdmin !== editing.is_admin) {
          await setAgentAdmin(editing.id, editAdmin);
        }
        await refresh();
      } else if (supabase) {
        const payload: Record<string, unknown> = {
          name: editName.trim(),
          role: editRole.trim() || 'Customer',
          branch: editBranch.trim() || null,
        };
        const { error } = await supabase.from('customers').update(payload).eq('id', editing.id);
        if (error) {
          const { error: e2 } = await supabase
            .from('customers')
            .update({ name: editName.trim() })
            .eq('id', editing.id);
          if (e2) throw e2;
        }
        await refresh();
      }
      setMsg('User updated.');
      setEditing(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not save user');
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!email.trim()) {
      setErr('This user has no email on file.');
      return;
    }
    if (!supabase) {
      setErr('Password reset requires Supabase.');
      return;
    }
    setResetBusy(true);
    setMsg('');
    setErr('');
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setMsg('Password reset email sent to ' + email);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Could not send reset email');
    } finally {
      setResetBusy(false);
    }
  };

  if (!currentAgent?.is_admin) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center max-w-lg mx-auto">
        <Shield className="mx-auto text-slate-300 mb-3" size={36} />
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Admin only</h2>
        <p className="text-sm text-slate-500">User management is restricted to admin accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">All users</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve new customer accounts here — no need to open Supabase for approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Clock size={18} className="text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-amber-900">
              {pendingCount} customer account{pendingCount !== 1 ? 's' : ''} waiting for approval
            </div>
            <div className="text-xs text-amber-800 mt-0.5">
              New portal signups appear here. Approve to grant full customer access.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          >
            Review pending
          </button>
        </div>
      )}

      {msg && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{msg}</div>
      )}
      {err && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{err}</div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, role, branch"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        {(['all', 'pending', 'admin', 'agent', 'customer'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              'text-xs font-medium px-3 py-1.5 rounded-lg border capitalize',
              filter === f
                ? 'bg-brand-50 border-brand-200 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {f}
            {f === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-left text-slate-500">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Branch workplace</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No users match.
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr
                key={u.key}
                className={clsx(
                  'border-b border-slate-100 hover:bg-slate-50/60',
                  u.status === 'pending' && 'bg-amber-50/40'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {u.agent ? (
                      <AgentAvatar agent={u.agent} size="sm" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                        {(u.name || '?').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 truncate">
                        {u.name}
                        {u.id === currentAgent.id && (
                          <span className="ml-1.5 text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{u.email || 'No email'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                      u.kind === 'agent' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'
                    )}
                  >
                    {u.kind}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.kind === 'customer' ? (
                    <span
                      className={clsx(
                        'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                        u.status === 'pending' && 'bg-amber-100 text-amber-800',
                        u.status === 'approved' && 'bg-emerald-50 text-emerald-700',
                        u.status === 'rejected' && 'bg-rose-50 text-rose-700',
                        !u.status && 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {u.status || 'approved'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.branch || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.kind === 'customer' && u.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={actionBusy === u.id}
                          onClick={() => void setCustomerStatus(u.id, 'approved')}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionBusy === u.id}
                          onClick={() => void setCustomerStatus(u.id, 'rejected')}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50"
                        >
                          <X size={12} /> Reject
                        </button>
                      </>
                    )}
                    {u.kind === 'customer' && u.status === 'rejected' && (
                      <button
                        type="button"
                        disabled={actionBusy === u.id}
                        onClick={() => void setCustomerStatus(u.id, 'approved')}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50"
                      >
                        <Check size={12} /> Approve
                      </button>
                    )}
                    {u.kind === 'customer' && u.status === 'approved' && (
                      <button
                        type="button"
                        disabled={actionBusy === u.id}
                        onClick={() => void setCustomerStatus(u.id, 'pending')}
                        className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={!u.email || resetBusy}
                      onClick={() => void sendPasswordReset(u.email)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-brand-100 text-brand-700 bg-brand-50 hover:bg-brand-100 disabled:opacity-40"
                    >
                      <KeyRound size={12} /> Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        {pendingCount > 0 ? `${pendingCount} pending · ` : ''}
        Showing {filtered.length} of {rows.length} people
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Edit user</h3>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {editing.kind} · {editing.email || 'no email'}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
                x
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Display name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>
            {editing.kind === 'agent' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Job title</label>
                  <input value={editRole} onChange={(e) => setEditRole(e.target.value)} disabled={editAdmin} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg disabled:bg-slate-50" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={editAdmin} disabled={editing.id === currentAgent.id} onChange={(e) => { setEditAdmin(e.target.checked); if (e.target.checked) setEditRole('Admin'); }} className="rounded border-slate-300" />
                  <Shield size={14} className="text-violet-600" /> Admin access
                </label>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Customer role</label>
                <input value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Building2 size={12} /> Branch workplace
              </label>
              <select value={editBranch} onChange={(e) => setEditBranch(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                <option value="">None</option>
                {branchNames.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button type="button" disabled={saving || !editName.trim()} onClick={() => void saveEdit()} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 text-sm text-slate-500">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-700 flex items-center gap-1">
          <UserRound size={12} /> Account approval
        </div>
        <p>
          When a customer creates an account on the portal, they appear here as <strong>pending</strong>.
          Click <strong>Approve</strong> — you do not need the Supabase dashboard for approval.
        </p>
        <p>
          <strong>Also once in Supabase:</strong> Authentication → Providers → Email → turn{' '}
          <strong>off</strong> &quot;Confirm email&quot; so they can sign in without an inbox link.
          App approval is separate from that setting.
        </p>
        <p className="text-slate-500 font-mono text-[10px] break-all">
          alter table public.customers add column if not exists status text default &apos;approved&apos;;
        </p>
      </div>
    </div>
  );
}
