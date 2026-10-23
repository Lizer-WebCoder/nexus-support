import { Ticket, MessageSquare, Search, BookOpen, ArrowLeft } from 'lucide-react';
import type { Ticket as TicketType } from '../types';

type Props = {
  displayName: string;
  myTickets: TicketType[];
  statusColor: Record<string, string>;
  onNavigate: (view: 'submit' | 'chat' | 'track' | 'mytickets' | 'help') => void;
  onOpenTicket: (id: string) => void;
};

export default function PortalHome({ displayName, myTickets, statusColor, onNavigate, onOpenTicket }: Props) {
  const openCount = myTickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length;
  const resolvedCount = myTickets.filter((t) => t.status === 'resolved').length;
  const recent = [...myTickets]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            {greeting}, {displayName}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Here's an overview of your support activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('submit')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            <Ticket size={16} /> New request
          </button>
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <MessageSquare size={16} /> Live chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open', value: openCount, color: 'text-amber-600' },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600' },
          { label: 'Total', value: myTickets.length, color: 'text-violet-600' },
          { label: 'Avg reply', value: '< 1d', color: 'text-zinc-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">{s.label}</div>
            <div className={`mt-1.5 text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Recent tickets</h2>
            <button type="button" onClick={() => onNavigate('mytickets')} className="text-xs font-medium text-violet-600 hover:text-violet-700">
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">No tickets yet.</p>
              <button type="button" onClick={() => onNavigate('submit')} className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700">
                Submit your first request →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTicket(t.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-zinc-400">{t.id}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor[t.status] || 'bg-zinc-100 text-zinc-600'}`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-zinc-900 truncate mt-0.5">{t.title}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {t.branch || 'No branch'} · {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowLeft size={14} className="text-zinc-300 rotate-180 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-3">Need help fast?</h2>
            <div className="space-y-2">
              <button type="button" onClick={() => onNavigate('chat')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50 text-left transition-colors">
                <MessageSquare size={16} className="text-violet-600 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-zinc-900">Start live chat</div>
                  <div className="text-[11px] text-zinc-500">Agents online now</div>
                </div>
              </button>
              <button type="button" onClick={() => onNavigate('track')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50 text-left transition-colors">
                <Search size={16} className="text-violet-600 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-zinc-900">Track by ticket ID</div>
                  <div className="text-[11px] text-zinc-500">Lookup any request</div>
                </div>
              </button>
              <button type="button" onClick={() => onNavigate('help')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/50 text-left transition-colors">
                <BookOpen size={16} className="text-violet-600 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-zinc-900">Browse help articles</div>
                  <div className="text-[11px] text-zinc-500">Self-serve answers</div>
                </div>
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-600 mb-1">Tip</div>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Include your branch and ticket number in live chat so agents can resolve issues faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
