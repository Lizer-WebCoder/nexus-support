import { useTickets } from '../context/TicketContext';
import { Database, HardDrive, ExternalLink } from 'lucide-react';

interface Props {
  onOpenPortal?: () => void;
}

export default function SettingsPage({ onOpenPortal }: Props) {
  const { usingSupabase, tickets, agents, refresh } = useTickets();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Customer portal</h2>
        <p className="text-sm text-slate-500 mb-3">
          Customers use a separate public portal to submit and track tickets. Agents use this Command Center.
        </p>
        <button
          onClick={onOpenPortal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
        >
          Open customer portal <ExternalLink size={14} />
        </button>
        <p className="text-xs text-slate-400 mt-2">
          Direct link: add <code className="bg-slate-100 px-1 rounded">#/portal</code> to the app URL
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
                ? 'Tickets are stored in your Supabase project and shared across devices.'
                : 'Tickets are saved in this browser only. Portal and agent share the same local data on this device.'}
            </p>
            {!usingSupabase && (
              <a href="https://github.com/Lizer-WebCoder/nexus-support/blob/main/SUPABASE_SETUP.md" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-sky-600 hover:text-sky-700">
                Setup guide <ExternalLink size={14} />
              </a>
            )}
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
        <button onClick={() => refresh()} className="mt-5 w-full py-2 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
          Refresh data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-2">About</h2>
        <p className="text-sm text-slate-500">
          Nexus Support v1.2 — agent command center + customer portal. React, TypeScript, Tailwind, Recharts.
        </p>
      </div>
    </div>
  );
}
