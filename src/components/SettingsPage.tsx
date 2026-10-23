import { useEffect, useState } from 'react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { Database, HardDrive, ExternalLink, LogOut, Moon, Rows3, UserPlus, Mail } from 'lucide-react';
import type { AgentStatus } from '../types';
import { applyUiPrefs, getCompactMode, getDarkMode, setCompactMode, setDarkMode, THEME_EVENT } from '../lib/uiPrefs';
import { loadAudit, loadAuditCloud } from '../lib/audit';
import { getAssignMode, setAssignMode, type AssignMode } from '../lib/assign';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Props {
  onOpenPortal?: () => void;
  onSignOut?: () => void;
}

export default function SettingsPage({ onOpenPortal, onSignOut }: Props) {
  const { usingSupabase, tickets, agents, refresh, currentAgent, updateAgentStatus, createTicket } = useTickets();
  const { user, requiresAuth } = useAuth();
  const [dark, setDark] = useState(getDarkMode);
  const [compact, setCompact] = useState(getCompactMode);
  const [audit, setAudit] = useState(() => loadAudit());
  const [assignMode, setAssignModeState] = useState<AssignMode>(getAssignMode);
  const [emailFrom, setEmailFrom] = useState('');
  const [emailName, setEmailName] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    applyUiPrefs();
  }, [dark, compact]);

  useEffect(() => {
    const sync = () => setDark(getDarkMode());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  useEffect(() => {
    void loadAuditCloud().then(setAudit);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDarkMode(next);
    setDark(next);
  };
  const toggleCompact = () => {
    const next = !compact;
    setCompactMode(next);
    setCompact(next);
  };

  const onAssignMode = (m: AssignMode) => {
    setAssignMode(m);
    setAssignModeState(m);
  };

  const createFromEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailFrom.trim()) {
      setEmailMsg('From and subject are required');
      return;
    }
    setEmailBusy(true);
    setEmailMsg('');
    try {
      const ticket = await createTicket({
        title: emailSubject.trim(),
        description: emailBody.trim() || '(empty body)',
        priority: 'medium',
        channel: 'email',
        customer_name: emailName.trim() || emailFrom.trim().split('@')[0],
        customer_email: emailFrom.trim(),
      });
      if (isSupabaseConfigured && supabase) {
        await supabase.from('email_inbound').insert({
          from_email: emailFrom.trim(),
          from_name: emailName.trim() || null,
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          ticket_id: ticket.id,
          processed: true,
        });
      }
      setEmailMsg(`Created ticket ${ticket.id}`);
      setEmailSubject('');
      setEmailBody('');
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setEmailBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Appearance</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="flex items-center gap-2 text-sm text-slate-700"><Moon size={16} className="text-brand-600" /> Dark mode</span>
            <button type="button" onClick={toggleDark} className={`w-11 h-6 rounded-full relative transition-colors ${dark ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${dark ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <span className="flex items-center gap-2 text-sm text-slate-700"><Rows3 size={16} className="text-brand-600" /> Compact density</span>
            <button type="button" onClick={toggleCompact} className={`w-11 h-6 rounded-full relative transition-colors ${compact ? 'bg-brand-600' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${compact ? 'left-5' : 'left-0.5'}`} />
            </button>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2"><UserPlus size={16} /> Assignment rules</h2>
        <p className="text-xs text-slate-500 mb-3">How new tickets get an assignee when none is chosen manually.</p>
        <select
          value={assignMode}
          onChange={(e) => onAssignMode(e.target.value as AssignMode)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
        >
          <option value="manual">Manual only (no auto-assign)</option>
          <option value="least_busy">Least busy (fewest open tickets)</option>
          <option value="branch">Prefer agents matching ticket branch</option>
          <option value="round_robin">Round robin among online agents</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2"><Mail size={16} /> Email → ticket</h2>
        <p className="text-xs text-slate-500 mb-3">
          Paste an inbound email to create a ticket now, or deploy the Edge Function in{' '}
          <code className="bg-slate-100 px-1 rounded">supabase/functions/inbound-email</code> and point Resend/SendGrid at it.
          Run <code className="bg-slate-100 px-1 rounded">supabase-p0.sql</code> for tables + Storage.
        </p>
        <form onSubmit={createFromEmail} className="space-y-3">
          {emailMsg && <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{emailMsg}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500">From email *</label>
              <input value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} type="email" required className="w-full px-3 py-2 text-sm border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-slate-500">From name</label>
              <input value={emailName} onChange={(e) => setEmailName(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500">Subject *</label>
            <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Body</label>
            <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
          <button type="submit" disabled={emailBusy} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg disabled:opacity-50">
            {emailBusy ? 'Creating…' : 'Create ticket from email'}
          </button>
        </form>
      </div>

      {user && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Signed in as</h2>
          <div className="text-sm text-slate-900 font-medium">{(user.user_metadata?.full_name as string) || user.email}</div>
          <div className="text-sm text-slate-500">{user.email}</div>
          {currentAgent && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-800">{currentAgent.name}</span>
              <span className="text-xs text-slate-500">{currentAgent.role}{currentAgent.is_admin ? ' · Admin' : ''}</span>
              <select value={currentAgent.status} onChange={(e) => updateAgentStatus(e.target.value as AgentStatus)} className="ml-auto text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white">
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          )}
          {onSignOut && (
            <button type="button" onClick={() => onSignOut()} className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Customer portal</h2>
        <p className="text-sm text-slate-500 mb-3">Share this with customers to submit and track tickets.</p>
        {onOpenPortal && (
          <button type="button" onClick={onOpenPortal} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100">
            <ExternalLink size={14} /> Open portal
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Data source</h2>
        <div className="flex items-start gap-3">
          {usingSupabase ? <Database className="text-emerald-600 shrink-0 mt-0.5" size={18} /> : <HardDrive className="text-amber-600 shrink-0 mt-0.5" size={18} />}
          <div>
            <div className="text-sm font-medium text-slate-800">{usingSupabase ? 'Supabase connected' : 'Local browser storage'}</div>
            <p className="text-xs text-slate-500 mt-1">{usingSupabase ? `${tickets.length} tickets · ${agents.length} agents` : 'Data stays on this device until Supabase env vars are set.'}</p>
            <button type="button" onClick={() => void refresh()} className="mt-2 text-xs text-brand-600 hover:underline">Refresh data</button>
          </div>
        </div>
        {requiresAuth && !user && <p className="mt-3 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">Sign in required for cloud mode.</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Audit log</h2>
          <button type="button" onClick={() => void loadAuditCloud().then(setAudit)} className="text-xs text-brand-600 hover:underline">Refresh</button>
        </div>
        <p className="text-xs text-slate-500 mb-3">Cloud audit when Supabase is connected; otherwise local browser log.</p>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-lg">
          {audit.length === 0 && <p className="p-4 text-sm text-slate-400 text-center">No audit entries yet</p>}
          {audit.slice(0, 40).map((a) => (
            <div key={a.id} className="px-3 py-2 text-xs">
              <div className="font-medium text-slate-800">{a.action} · {a.entity} <span className="font-mono text-slate-400">{a.entity_id}</span></div>
              {a.detail && <div className="text-slate-500 mt-0.5 line-clamp-2">{a.detail}</div>}
              <div className="text-slate-400 mt-0.5">{a.actor || '—'} · {new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
