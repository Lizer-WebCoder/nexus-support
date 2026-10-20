import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { Database, HardDrive, ExternalLink, LogOut } from 'lucide-react';
import type { AgentStatus } from '../types';

interface Props {
  onOpenPortal?: () => void;
  onSignOut?: () => void;
}

export default function SettingsPage({ onOpenPortal, onSignOut }: Props) {
  const { usingSupabase, tickets, agents, refresh, currentAgent, updateAgentStatus } = useTickets();
  const { user, requiresAuth } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      {user && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Signed in as</h2>
          <div className="text-sm text-slate-900 font-medium">
            {(user.user_metadata?.full_name as string) || user.email}
          </div>
          <div className="text-sm text-slate-500">{user.email}</div>
          {currentAgent && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-xs text-slate-500">Agent profile</div>
              <span className="text-sm font-medium text-slate-800">{currentAgent.name}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{currentAgent.role}</span>
              <select
                value={currentAgent.status}
                onChange={(e) => updateAgentStatus(e.target.value as AgentStatus)}
                className="ml-auto text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={() => onSignOut()}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Customer portal</h2>
        <p className="text-sm text-slate-500 mb-3">
          Public page for customers to submit and track tickets. No agent login required.
        </p>
        <button
          type="button"
          onClick={onOpenPortal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
        >
          Open customer portal <ExternalLink size={14} />
        </button>
        <p className="text-xs text-slate-400 mt-2">
          URL ends with <code className="bg-slate-100 px-1 rounded">#/portal</code>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Data source</h2>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${usingSupabase ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {usingSupabase ? <Database size={24} /> : <HardDrive size={24} />}
          </div>
          <div className="flex-1">
            <div className="font-medium text-slate-900">
              {usingSupabase ? 'Supabase connected' : 'Local mode (browser storage)'}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {usingSupabase
                ? requiresAuth
                  ? 'Agent login is required. Tickets sync in real time with your Supabase project.'
                  : 'Tickets are stored in your Supabase project.'
                : 'No Supabase keys detected. Data stays in this browser. See SUPABASE_SETUP.md to enable cloud + agent accounts.'}
            </p>
            <a
              href="https://github.com/Lizer-WebCoder/nexus-support/blob/main/SUPABASE_SETUP.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Setup guide <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Stats</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{tickets.length}</div>
            <div className="text-xs text-slate-500 mt-1">Tickets</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{agents.length}</div>
            <div className="text-xs text-slate-500 mt-1">Agents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {tickets.filter((t) => t.status !== 'resolved').length}
            </div>
            <div className="text-xs text-slate-500 mt-1">Open</div>
          </div>
        </div>
        <button type="button" onClick={() => refresh()} className="mt-5 w-full py-2 text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg">
          Refresh data
        </button>
      </div>
    </div>
  );
}
