import { useState, useMemo } from 'react';
import { Search, CheckCircle2, Ticket, BookOpen, ArrowLeft, MessageSquare, LogIn, LogOut, User } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import type { Priority, Ticket as TicketType } from '../types';
import { INITIAL_BRANCHES } from '../data';
import PortalLiveChat from './PortalLiveChat';

interface Props { onBackToAgent?: () => void; }
type PortalView = 'home' | 'submit' | 'track' | 'success' | 'help' | 'chat' | 'account' | 'mytickets';

const HELP_ARTICLES = [
  { title: 'Reset your password', body: 'Go to Account → Sign in. Use the same email you registered with.' },
  { title: 'Check service status', body: 'Visit status.nexus.support for live incident updates before opening a ticket.' },
  { title: 'Billing & invoices', body: 'Invoices are emailed on the 1st of each month. Include your invoice number when submitting a request.' },
  { title: 'API rate limits', body: 'Free plans allow 60 requests/minute. Pro plans allow 600.' },
];

const BRANCH_OPTIONS = INITIAL_BRANCHES.map((b) => b.name);

function LogoMark() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md shadow-brand-500/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="3" fill="white" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}

export default function CustomerPortal({ onBackToAgent }: Props) {
  const { createTicket, findTicket, tickets, ticketsForEmail } = useTickets();
  const { user, accountRole, signIn, signUp, signOut, requiresAuth, configError } = useAuth();
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const isCustomerSession = !!user && accountRole === 'customer';
  const myTickets = isCustomerSession && user?.email ? ticketsForEmail(user.email) : [];

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
      setName(''); setEmail(''); setBranch(''); setTitle(''); setDescription(''); setPriority('medium');
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
    const t = findTicket(trackId, trackEmail || undefined);
    if (!t) {
      setTrackError('No ticket found. Check the ID and email you used when submitting.');
      return;
    }
    setTracked(t);
  };

  const doAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');
    setAuthLoading(true);
    try {
      if (authMode === 'signin') await signIn(authEmail.trim(), authPassword);
      else {
        await signUp(authEmail.trim(), authPassword, authName.trim() || undefined, 'customer');
        setAuthInfo('Account created. Sign in with your email and password.');
        setAuthMode('signin');
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    new: 'bg-brand-100 text-brand-700',
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-violet-100 text-violet-700',
    'on-hold': 'bg-zinc-100 text-zinc-600',
    resolved: 'bg-emerald-100 text-emerald-700',
  };

  const homeCards = [
    { id: 'submit' as const, Icon: Ticket, title: 'Submit a request', desc: 'Report a problem or ask a question' },
    { id: 'chat' as const, Icon: MessageSquare, title: 'Live chat', desc: 'Talk to an agent in real time' },
    { id: 'track' as const, Icon: Search, title: 'Track a ticket', desc: 'Check status with your ticket ID' },
    { id: 'mytickets' as const, Icon: User, title: 'My tickets', desc: isCustomerSession ? 'Tickets linked to your email' : 'Sign in to see your tickets' },
    { id: 'help' as const, Icon: BookOpen, title: 'Help articles', desc: 'Find answers without waiting' },
    { id: 'account' as const, Icon: LogIn, title: isCustomerSession ? 'Account' : 'Sign in', desc: isCustomerSession ? 'Manage your customer account' : 'Optional account for ticket history' },
  ];

  const field = 'w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 text-zinc-900';
  const btnPrimary = 'w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50';

  return (
    <div className="min-h-screen portal-atmosphere">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button type="button" onClick={() => setView('home')} className="flex items-center gap-2.5">
            <LogoMark />
            <div className="text-left">
              <div className="font-semibold text-zinc-900 text-sm tracking-tight">Nexus Ops</div>
              <div className="text-[11px] text-zinc-500">Customer portal</div>
            </div>
          </button>
          <nav className="flex items-center gap-1 text-sm flex-wrap justify-end">
            {(['submit', 'chat', 'track', 'mytickets'] as const).map((id) => (
              <button key={id} type="button" onClick={() => setView(id)} className="px-2 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 font-medium capitalize">
                {id === 'mytickets' ? 'My tickets' : id === 'submit' ? 'Submit' : id === 'chat' ? 'Chat' : 'Track'}
              </button>
            ))}
            <button type="button" onClick={() => setView('account')} className="px-2 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 font-medium">
              {isCustomerSession ? 'Account' : 'Sign in'}
            </button>
            {onBackToAgent && (
              <button type="button" onClick={onBackToAgent} className="ml-1 px-2 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600">Agent login</button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {view === 'home' && (
          <div className="text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-x-0 -top-6 mx-auto h-32 w-72 rounded-full bg-brand-400/25 blur-3xl pointer-events-none" />
              <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-100 text-xs font-medium text-brand-700 shadow-sm mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Support online · avg reply under 1 business day
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">How can we help?</h1>
              <p className="text-zinc-500 mt-2 max-w-md mx-auto">
                {isCustomerSession ? `Signed in as ${user?.email}` : 'Submit a request, chat with an agent, or check ticket status.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {homeCards.map((card) => {
                const Icon = card.Icon;
                return (
                  <button key={card.id} type="button" onClick={() => setView(card.id)}
                    className="bg-white/90 backdrop-blur rounded-2xl border border-zinc-200 shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition-all text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3"><Icon size={20} /></div>
                    <div className="font-semibold text-zinc-900">{card.title}</div>
                    <div className="text-sm text-zinc-500 mt-1">{card.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'chat' && <PortalLiveChat onBack={() => setView('home')} />}

        {view === 'submit' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft size={16} /> Back</button>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/80 border border-brand-100 text-[11px] font-medium text-brand-700 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Support queue open
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Submit a request</h1>
              <p className="text-zinc-500 text-sm mt-1">We typically respond within one business day.</p>
            </div>
            <form onSubmit={submit} className="bg-white/90 backdrop-blur rounded-2xl border border-zinc-200 shadow-card p-6 sm:p-8 space-y-5">
              {error && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Your name *</label><input value={name} onChange={(e) => setName(e.target.value)} required className={field} /></div>
                <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Branch *</label>
                <select value={branch} onChange={(e) => setBranch(e.target.value)} required className={field + ' bg-white'}>
                  <option value="">Select branch…</option>
                  {branchOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Subject *</label><input value={title} onChange={(e) => setTitle(e.target.value)} required className={field} /></div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Details</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={field} /></div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field + ' bg-white'}>
                  {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Submitting…' : 'Submit request'}</button>
            </form>
          </div>
        )}

        {view === 'success' && created && (
          <div className="max-w-md mx-auto text-center space-y-4">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <h1 className="text-2xl font-bold text-zinc-900">Request received</h1>
            <p className="text-zinc-500 text-sm">Your ticket ID is <span className="font-mono font-semibold text-brand-700">{created.id}</span>. Save it to track progress.</p>
            <div className="flex gap-2 justify-center">
              <button type="button" onClick={() => { setTrackId(created.id); setView('track'); }} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl">Track ticket</button>
              <button type="button" onClick={() => setView('home')} className="px-4 py-2 border border-zinc-200 text-sm rounded-xl bg-white">Home</button>
            </div>
          </div>
        )}

        {view === 'track' && (
          <div className="max-w-md mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft size={16} /> Back</button>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Track a ticket</h1>
            <p className="text-zinc-500 text-sm mb-6">Enter the ticket ID from your confirmation email.</p>
            <form onSubmit={track} className="bg-white/90 backdrop-blur rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
              {trackError && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{trackError}</div>}
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Ticket ID</label><input value={trackId} onChange={(e) => setTrackId(e.target.value)} required className={field + ' font-mono'} placeholder="NX-2841" /></div>
              <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email (optional)</label><input type="email" value={trackEmail} onChange={(e) => setTrackEmail(e.target.value)} className={field} /></div>
              <button type="submit" className={btnPrimary}>Look up</button>
            </form>
            {tracked && (
              <div className="mt-4 bg-white rounded-2xl border border-zinc-200 p-5 space-y-2">
                <div className="flex justify-between"><span className="font-mono text-xs text-zinc-400">{tracked.id}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor[tracked.status] || ''}`}>{tracked.status}</span>
                </div>
                <div className="font-semibold text-zinc-900">{tracked.title}</div>
                <div className="text-xs text-zinc-500">{tracked.branch || 'No branch'} · {new Date(tracked.created_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {view === 'help' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft size={16} /> Back</button>
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">Help articles</h1>
            <div className="space-y-3">
              {HELP_ARTICLES.map((a) => (
                <div key={a.title} className="bg-white/90 rounded-xl border border-zinc-200 p-4 text-left">
                  <div className="font-semibold text-zinc-900 text-sm">{a.title}</div>
                  <div className="text-sm text-zinc-500 mt-1">{a.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'mytickets' && (
          <div className="max-w-lg mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft size={16} /> Back</button>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">My tickets</h1>
            {!isCustomerSession ? (
              <div className="mt-6 bg-white/90 rounded-2xl border border-zinc-200 p-6 text-center space-y-3">
                <p className="text-sm text-zinc-600">Sign in with a customer account to list tickets under your email.</p>
                <button type="button" onClick={() => setView('account')} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl">Sign in</button>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {myTickets.length === 0 && <p className="text-sm text-zinc-500 text-center py-8">No tickets found for {user?.email}.</p>}
                {myTickets.map((t) => (
                  <div key={t.id} className="bg-white/90 rounded-xl border border-zinc-200 shadow-sm p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-zinc-400">{t.id}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusColor[t.status] || ''}`}>{t.status.replace('-', ' ')}</span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 mt-1">{t.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{t.branch || 'No branch'} · {new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'account' && (
          <div className="max-w-md mx-auto">
            <button type="button" onClick={() => setView('home')} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6"><ArrowLeft size={16} /> Back</button>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Customer account</h1>
            <p className="text-zinc-500 text-sm mb-6">Optional. Sign in to see all tickets under your email.</p>
            {configError && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">{configError}</div>}
            {isCustomerSession ? (
              <div className="bg-white/90 rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
                <div className="text-sm text-zinc-600">Signed in as</div>
                <div className="font-semibold text-zinc-900">{user?.email}</div>
                <button type="button" onClick={() => setView('mytickets')} className={btnPrimary}>View my tickets</button>
                <button type="button" onClick={() => signOut()} className="w-full py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-xl inline-flex items-center justify-center gap-2">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            ) : user && accountRole === 'agent' ? (
              <div className="bg-white/90 rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-3">
                <p className="text-sm text-zinc-600">You are signed in as an <strong>agent</strong> ({user.email}).</p>
                <button type="button" onClick={() => signOut()} className="w-full py-2 text-sm font-medium text-zinc-600 border rounded-xl">Sign out</button>
              </div>
            ) : requiresAuth ? (
              <div className="bg-white/90 rounded-2xl border border-zinc-200 shadow-sm p-6">
                <div className="flex rounded-lg bg-zinc-100 p-1 mb-4">
                  <button type="button" onClick={() => setAuthMode('signin')} className={`flex-1 py-2 text-sm font-medium rounded-md ${authMode === 'signin' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}>Sign in</button>
                  <button type="button" onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-sm font-medium rounded-md ${authMode === 'signup' ? 'bg-white shadow-sm' : 'text-zinc-500'}`}>Register</button>
                </div>
                <form onSubmit={doAuth} className="space-y-3">
                  {authError && <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{authError}</div>}
                  {authInfo && <div className="text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">{authInfo}</div>}
                  {authMode === 'signup' && (
                    <div><label className="block text-sm font-medium text-zinc-700 mb-1">Full name</label><input value={authName} onChange={(e) => setAuthName(e.target.value)} className={field} /></div>
                  )}
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Email</label><input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={field} /></div>
                  <div><label className="block text-sm font-medium text-zinc-700 mb-1">Password</label><input type="password" required minLength={6} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className={field} /></div>
                  <button type="submit" disabled={authLoading} className={btnPrimary}>{authLoading ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create customer account'}</button>
                </form>
              </div>
            ) : (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">Accounts require Supabase. Use Track with ticket ID instead.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
