import { useState } from 'react';
import { Home, Users, Ticket, MessageSquare, Search, User, BookOpen, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PortalAuthGate from './PortalAuthGate';
import PortalHome from './PortalHome';
import ThemeToggle from './ThemeToggle';
import PortalSpaceLoungeBg from './PortalSpaceLoungeBg';

type PortalView = 'home' | 'submit' | 'track' | 'help' | 'chat' | 'account' | 'mytickets' | 'community';

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

const VIEW_TITLES: Record<PortalView, string> = {
  home: 'Home',
  submit: 'Submit a request',
  track: 'Track a ticket',
  help: 'Help articles',
  chat: 'Live chat',
  account: 'Account',
  mytickets: 'My tickets',
  community: 'Community',
};

export default function CustomerPortal({ onBackToAgent }: { onBackToAgent?: () => void }) {
  const { user, accountRole, signOut } = useAuth();
  const [view, setView] = useState<PortalView>('home');
  const isCustomerSession = !!user && accountRole === 'customer';
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Customer';
  const initials = displayName.slice(0, 2).toUpperCase();

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

  const iconColor: Record<string, string> = {
    home: 'text-violet-400',
    community: 'text-sky-400',
    submit: 'text-amber-400',
    chat: 'text-fuchsia-400',
    track: 'text-emerald-400',
    mytickets: 'text-blue-400',
    help: 'text-indigo-400',
    account: 'text-pink-400',
  };

  if (!isCustomerSession) {
    return <PortalAuthGate onBackToAgent={onBackToAgent}>{null}</PortalAuthGate>;
  }

  return (
    <div className="app-cosmos flex min-h-screen relative">
      <aside className="portal-sidebar hidden md:flex w-60 shrink-0 flex-col relative z-30">
        <div className="portal-sidebar-header px-4 py-5 flex items-center gap-3">
          <BrandMark />
          <div>
            <div className="text-sm font-semibold tracking-tight portal-sidebar-title">Nexus Ops</div>
            <div className="text-[11px] portal-sidebar-sub">Customer portal</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider portal-sidebar-label">Support</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={`portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'portal-nav-active' : ''
                }`}
              >
                <Icon size={18} className={`shrink-0 ${iconColor[item.id] || 'text-violet-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="portal-sidebar-footer p-3 space-y-1">
          {onBackToAgent && (
            <button type="button" onClick={onBackToAgent} className="portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium">
              <ExternalLink size={16} /> Agent desk
            </button>
          )}
          <button type="button" onClick={() => signOut()} className="portal-nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <div className="portal-shell flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <PortalSpaceLoungeBg />
        <header className="relative z-20 h-12 shrink-0 nexus-topbar flex items-center gap-3 px-4 lg:px-6">
          <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{VIEW_TITLES[view]}</div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">{initials}</div>
          </div>
        </header>
        <main className="relative z-10 flex-1 overflow-y-auto p-4 lg:p-6">
          {view === 'home' && <PortalHome onNavigate={(v) => setView(v as PortalView)} />}
          {view !== 'home' && (
            <div className="portal-glass-card rounded-2xl p-6 max-w-2xl">
              <h1 className="text-lg font-semibold mb-2">{VIEW_TITLES[view]}</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">This section is being restored. Home and navigation are live.</p>
              <button type="button" onClick={() => setView('home')} className="mt-4 text-sm text-violet-600 hover:underline">Back to home</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
