import { useState, useMemo, useEffect } from 'react';
import {
  Search, CheckCircle2, Ticket, BookOpen, ArrowLeft, MessageSquare,
  LogOut, User, Star, Home, ExternalLink, Users,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import type { Priority, Ticket as TicketType } from '../types';
import { INITIAL_BRANCHES } from '../data';
import PortalLiveChat from './PortalLiveChat';
import PortalAuthGate from './PortalAuthGate';
import PortalHome from './PortalHome';
import PortalCommunityChat from './PortalCommunityChat';

interface Props { onBackToAgent?: () => void; }
type PortalView = 'home' | 'submit' | 'track' | 'success' | 'help' | 'chat' | 'account' | 'mytickets' | 'community';

const HELP_ARTICLES = [
  { title: 'Reset your password', body: 'Go to Account → Sign in. Use the same email you registered with.' },
  { title: 'Check service status', body: 'Visit status.nexus.support for live incident updates before opening a ticket.' },
  { title: 'Billing & invoices', body: 'Invoices are emailed on the 1st of each month. Include your invoice number when submitting a request.' },
  { title: 'API rate limits', body: 'Free plans allow 60 requests/minute. Pro plans allow 600.' },
];

const BRANCH_OPTIONS = INITIAL_BRANCHES.map((b) => b.name);

const VIEW_TITLES: Record<PortalView, string> = {
  home: 'Home',
  submit: 'Submit a request',
  track: 'Track a ticket',
  success: 'Request received',
  help: 'Help articles',
  chat: 'Live chat',
  account: 'Account',
  mytickets: 'My tickets',
  community: 'Community',
};

function BrandMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`${className} rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-900/40`}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />
        <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}

export default function CustomerPortal({ onBackToAgent }: Props) {
  const { createTicket, findTicket, tickets, ticketsForEmail } = useTickets();
  const { user, accountRole, signOut, requiresAuth, configError } = useAuth();
  const { addSurvey, surveys } = usePlatform();
  const [view, setView] = useState<PortalView>('home');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
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
  const [csatScore, setCsatScore] = useState(5);
  const [csatComment, setCsatComment] = useState('');
  const [csatDone, setCsatDone] = useState(false);
  const [csatSaving, setCsatSaving] = useState(false);

  const isCustomerSession = !!user && accountRole === 'customer';
  const myTickets = isCustomerSession && user?.email ? ticketsForEmail(user.email) : [];
  const displayName =
    (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Customer';
  const initials = displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!isCustomerSession || !user) return;
    const display = (user.user_metadata?.full_name as string) || '';
    if (display) setName((n) => n || display);
    if (user.email) setEmail((e) => e || user.email || '');
  }, [isCustomerSession, user]);

  const branchOptions = useMemo(() => {
    const set = new Set(BRANCH_OPTIONS);
    tickets.forEach((t) => { if (t.branch) set.add(t.branch); });
    try {
      const raw = localStorage.getItem('nexus-branches-v1');
      if (raw) (JSON.parse(raw) as { name: string }[]).forEach((b) => set.add(b.name));
    } catch {}
    return Array.from(set).sort();
  }, [tickets]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !title.trim() || !branch.trim()) {
      setError('Name, email, branch, and subject are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const ticket = await createTicket({
        title: title.trim(), description: description.trim(), priority, channel: 'portal',
        customer_name: name.trim(), customer_email: email.trim(), branch: branch.trim(),
      });
      setCreated(ticket);
      setView('success');
      setTitle(''); setDescription(''); setPriority('medium');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not submit request');
    } finally {
      setSaving(false);
    }
  };

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTracked(null);
    setCsatDone(false);
    setCsatComment('');
    setCsatScore(5);
    const t = findTicket(trackId, trackEmail || user?.email || undefined);
    if (!t) {
      setTrackError('No ticket found. Check the ID and email you used when submitting.');
      return;
    }
    setTracked(t);
    setCsatDone(surveys.some((s) => s.ticket_id === t.id));
  };

  const submitCsat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tracked) return;
    setCsatSaving(true);
    try {
      await addSurvey({
        ticket_id: tracked.id,
        score: csatScore,
        comment: csatComment.trim() || undefined,
        customer_name: tracked.customer_name || name || undefined,
      });
      setCsatDone(true);
    } finally {
      setCsatSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    new: 'bg-violet-100 text-violet-700',
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-violet-100 text-violet-700',
    'on-hold': 'bg-zinc-100 text-zinc-600',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  const navItems: { id: PortalView; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'submit', label: 'Submit request', icon: Ticket },
    { id: 'chat', label: 'Live chat', icon: MessageSquare },
    { id: 'track', label: 'Track ticket', icon: Search },
    { id: 'mytickets', label: 'My tickets', icon: User },
    { id: 'help', label: 'Help articles', icon: BookOpen },
    { id: 'account', label: 'Account', icon: User },
  ];

  const field =
    'w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 focus:bg-white text-zinc-900 placeholder:text-zinc-400';
  const btnPrimary =
    'w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors';

  if (!isCustomerSession) {
    return <PortalAuthGate onBackToAgent={onBackToAgent}>{null}</PortalAuthGate>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden md:flex w-60 shrink-0 bg-zinc-950 text-zinc-100 flex-col border-r border-zinc-800/80">
        <div className="px-4 py-5 flex items-center gap-3 border-b border-zinc-800/80">
          <BrandMark />
          <div>
            <div className="text-sm font-semibold tracking-tight">Nexus Ops</div>
            <div className="text-[11px] text-zinc-500">Customer portal</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Support</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id || (view === 'success' && item.id === 'submit');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-brand-600/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-zinc-800/80 space-y-1">
          {onBackToAgent && (
            <button type="button" onClick={onBackToAgent} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-200">
              <ExternalLink size={16} /> Agent desk
            </button>
          )}
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-zinc-100 truncate">{displayName}</div>
              <div className="text-[11px] text-zinc-500 truncate">{user?.email}</div>
            </div>
          </div>
          {requiresAuth && (
            <button type="button" onClick={() => void signOut()} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-zinc-200">
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center gap-3 px-4 lg:px-6">
          <div className="md:hidden"><BrandMark className="w-8 h-8" /></div>
          <div className="text-sm font-semibold text-zinc-800">{VIEW_TITLES[view]}</div>
          <div className="flex-1" />
          <div className="flex md:hidden items-center gap-1 overflow-x-auto">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  view === item.id ? 'bg-violet-50 text-violet-700' : 'text-zinc-500'
                }`}
              >
                {item.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Support online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            {view === 'home' && (
              <PortalHome
                displayName={displayName}
                onNavigate={(v) => setView(v)}
              />
            )}

            {view === 'community' && (
              <PortalCommunityChat
                displayName={displayName}
                email={user?.email || ''}
                onBack={() => setView('home')}
              />
            )}

            {view === 'chat' && <PortalLiveChat onBack={() => setView('home')} />}

            {view === 'submit' && (
              <div className="max-w-lg">
                <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5">
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="mb-5">
                  <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Submit a request</h1>
                  <p className="text-zinc-500 text-sm mt-1">We typically respond within one business day.</p>
                </div>
                <form onSubmit={submit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
                  {error && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Your name *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} required className={field} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email *</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Branch *</label>
                    <select value={branch} onChange={(e) => setBranch(e.target.value)} required className={field}>
                      <option value="">Select branch…</option>
                      {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Subject *</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required className={field} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Details</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={field} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
                      {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Submitting…' : 'Submit request'}</button>
                </form>
              </div>
            )}

            {view === 'success' && created && (
              <div className="max-w-md text-center space-y-4 py-8">
                <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
                <h1 className="text-xl font-semibold text-zinc-900">Request received</h1>
                <p className="text-zinc-500 text-sm">Your ticket ID is <span className="font-mono font-semibold text-violet-700">{created.id}</span>.</p>
                <div className="flex gap-2 justify-center">
                  <button type="button" onClick={() => { setTrackId(created.id); setView('track'); }} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">Track ticket</button>
                  <button type="button" onClick={() => setView('home')} className="px-4 py-2 border border-zinc-200 text-sm rounded-lg bg-white hover:bg-zinc-50">Home</button>
                </div>
              </div>
            )}

            {view === 'track' && (
              <div className="max-w-md">
                <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-xl font-semibold text-zinc-900 mb-1">Track a ticket</h1>
                <form onSubmit={track} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 mt-4">
                  {trackError && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{trackError}</div>}
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Ticket ID</label>
                    <input value={trackId} onChange={(e) => setTrackId(e.target.value)} required className={field + ' font-mono'} placeholder="NX-2841" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">Email (optional)</label>
                    <input type="email" value={trackEmail} onChange={(e) => setTrackEmail(e.target.value)} placeholder={user?.email || ''} className={field} />
                  </div>
                  <button type="submit" className={btnPrimary}>Look up</button>
                </form>
                {tracked && (
                  <div className="mt-4 bg-white rounded-xl border border-zinc-200 p-5 space-y-3 shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs text-zinc-400">{tracked.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor[tracked.status] || ''}`}>{tracked.status}</span>
                    </div>
                    <div className="font-semibold text-zinc-900">{tracked.title}</div>
                    <div className="text-xs text-zinc-500">{tracked.branch || 'No branch'} · {new Date(tracked.created_at).toLocaleString()}</div>
                    {tracked.status === 'resolved' && (
                      <div className="pt-3 border-t border-zinc-100">
                        {csatDone ? (
                          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">Thanks for rating this support experience.</p>
                        ) : (
                          <form onSubmit={submitCsat} className="space-y-3">
                            <p className="text-sm font-medium text-zinc-800">How was our support?</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => setCsatScore(n)} className={`p-2 rounded-lg border ${csatScore >= n ? 'bg-violet-50 border-violet-200 text-violet-600' : 'border-zinc-200 text-zinc-300'}`}>
                                  <Star size={18} fill={csatScore >= n ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                            <textarea value={csatComment} onChange={(e) => setCsatComment(e.target.value)} rows={2} placeholder="Optional comment" className={field} />
                            <button type="submit" disabled={csatSaving} className={btnPrimary}>{csatSaving ? 'Sending…' : 'Submit rating'}</button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {view === 'help' && (
              <div className="max-w-lg">
                <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-xl font-semibold text-zinc-900 mb-5">Help articles</h1>
                <div className="space-y-3">
                  {HELP_ARTICLES.map((a) => (
                    <div key={a.title} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
                      <div className="font-semibold text-zinc-900 text-sm">{a.title}</div>
                      <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{a.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'mytickets' && (
              <div className="max-w-lg">
                <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-xl font-semibold text-zinc-900 mb-5">My tickets</h1>
                {myTickets.length === 0 ? (
                  <p className="text-sm text-zinc-500 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">No tickets linked to {user?.email} yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((t) => (
                      <button key={t.id} type="button" onClick={() => { setTrackId(t.id); setView('track'); }} className="w-full text-left bg-white rounded-xl border border-zinc-200 shadow-sm p-4 hover:border-violet-300">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-mono text-xs text-zinc-400">{t.id}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor[t.status] || ''}`}>{t.status}</span>
                        </div>
                        <div className="font-medium text-zinc-900 mt-1 text-sm">{t.title}</div>
                        <div className="text-xs text-zinc-500 mt-1">{t.branch || 'No branch'} · {new Date(t.created_at).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'account' && (
              <div className="max-w-md">
                <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-5"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-xl font-semibold text-zinc-900 mb-5">Account</h1>
                <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
                  {configError && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{configError}</p>}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">{initials}</div>
                    <div>
                      <div className="font-medium text-zinc-900">{displayName}</div>
                      <div className="text-sm text-zinc-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-zinc-100 space-y-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Role</div>
                      <div className="text-sm font-medium text-zinc-800 capitalize mt-0.5">{accountRole || 'customer'}</div>
                    </div>
                    {requiresAuth && (
                      <button type="button" onClick={() => void signOut()} className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50">
                        <LogOut size={16} /> Sign out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
