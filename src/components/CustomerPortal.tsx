import { useState } from 'react';
import { Search, CheckCircle2, Ticket, BookOpen, ArrowLeft, MessageSquare } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Priority, Ticket as TicketType } from '../types';
import PortalLiveChat from './PortalLiveChat';

interface Props {
  onBackToAgent?: () => void;
}

type PortalView = 'home' | 'submit' | 'track' | 'success' | 'help' | 'chat';

const HELP_ARTICLES = [
  { title: 'Reset your password', body: 'Go to Sign in → Forgot password. Check spam if the email does not arrive within 5 minutes.' },
  { title: 'Check service status', body: 'Visit status.nexus.support for live incident updates before opening a ticket.' },
  { title: 'Billing & invoices', body: 'Invoices are emailed on the 1st of each month. For discrepancies, include your invoice number when submitting a request.' },
  { title: 'API rate limits', body: 'Free plans allow 60 requests/minute. Pro plans allow 600. Contact support if you need a higher limit.' },
];

export default function CustomerPortal({ onBackToAgent }: Props) {
  const { createTicket, findTicket } = useTickets();
  const [view, setView] = useState<PortalView>('home');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<TicketType | null>(null);

  const [trackId, setTrackId] = useState('');
  const [trackEmail, setTrackEmail] = useState('');
  const [tracked, setTracked] = useState<TicketType | null>(null);
  const [trackError, setTrackError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !title.trim()) {
      setError('Name, email, and subject are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        channel: 'portal',
        customer_name: company.trim() || name.trim(),
        customer_email: email.trim(),
      });
      setCreated(ticket);
      setView('success');
      setName('');
      setEmail('');
      setCompany('');
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit request';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTracked(null);
    const t = findTicket(trackId, trackEmail || undefined);
    if (!t) {
      setTrackError('No ticket found. Check the ID and email you used when submitting.');
      return;
    }
    setTracked(t);
  };

  const statusColor: Record<string, string> = {
    new: 'bg-sky-100 text-sky-700',
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-violet-100 text-violet-700',
    'on-hold': 'bg-slate-100 text-slate-600',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  const homeCards = [
    { id: 'submit' as const, Icon: Ticket, title: 'Submit a request', desc: 'Report a problem or ask a question' },
    { id: 'chat' as const, Icon: MessageSquare, title: 'Live chat', desc: 'Talk to an agent in real time' },
    { id: 'track' as const, Icon: Search, title: 'Track a ticket', desc: 'Check status with your ticket ID' },
    { id: 'help' as const, Icon: BookOpen, title: 'Help articles', desc: 'Find answers without waiting' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button type="button" onClick={() => setView('home')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-900 text-sm">Nexus Support</div>
              <div className="text-[11px] text-slate-500">Customer Portal</div>
            </div>
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <button type="button" onClick={() => setView('submit')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium">Submit</button>
            <button type="button" onClick={() => setView('chat')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium">Chat</button>
            <button type="button" onClick={() => setView('track')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium">Track</button>
            <button type="button" onClick={() => setView('help')} className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium">Help</button>
            {onBackToAgent && (
              <button type="button" onClick={onBackToAgent} className="ml-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600">
                Agent login
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {view === 'home' && (
          <div className="text-center space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">How can we help?</h1>
              <p className="text-slate-500 mt-2">Submit a request, chat with an agent, or check ticket status.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {homeCards.map((card) => {
                const Icon = card.Icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setView(card.id)}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-sky-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                      <Icon size={20} />
                    </div>
                    <div className="font-semibold text-slate-900">{card.title}</div>
                    <div className="text-sm text-slate-500 mt-1">{card.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'chat' && <PortalLiveChat onBack={() => setView('home')} />}

        {view === 'submit' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Submit a request</h1>
            <p className="text-slate-500 text-sm mb-6">We typically respond within one business day.</p>
            <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              {error && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Your name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Brief summary of your issue"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                  placeholder="Steps to reproduce, error messages…"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50">
                {saving ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          </div>
        )}

        {view === 'success' && created && (
          <div className="max-w-md mx-auto text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Request submitted</h1>
            <p className="text-slate-500">Save your ticket ID to track progress.</p>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Ticket ID</div>
              <div className="text-2xl font-mono font-bold text-sky-700 mt-1">{created.id}</div>
              <div className="text-sm text-slate-600 mt-3">{created.title}</div>
            </div>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => { setTrackId(created.id); setView('track'); }}
                className="px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Track this ticket
              </button>
              <button type="button" onClick={() => setView('home')}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Done
              </button>
            </div>
          </div>
        )}

        {view === 'track' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Track a ticket</h1>
            <form onSubmit={track} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              {trackError && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{trackError}</div>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ticket ID *</label>
                <input value={trackId} onChange={(e) => setTrackId(e.target.value)} required placeholder="e.g. NX-2842"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (optional)</label>
                <input type="email" value={trackEmail} onChange={(e) => setTrackEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/30" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700">
                Look up ticket
              </button>
            </form>
            {tracked && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-slate-400">{tracked.id}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor[tracked.status] || ''}`}>
                    {tracked.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-lg font-semibold text-slate-900">{tracked.title}</div>
              </div>
            )}
          </div>
        )}

        {view === 'help' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
              <ArrowLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Help articles</h1>
            <div className="space-y-3 mt-6">
              {HELP_ARTICLES.map((a) => (
                <div key={a.title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <div className="font-semibold text-slate-900">{a.title}</div>
                  <p className="text-sm text-slate-600 mt-2">{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
