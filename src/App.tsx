import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Ticket,
  MessageSquare,
  Users,
  Building2,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { TicketProvider, useTickets } from './context/TicketContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import CustomerPortal from './components/CustomerPortal';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import TicketsPage from './components/TicketsPage';
import LiveChatPage from './components/LiveChatPage';
import CustomersPage from './components/CustomersPage';
import BranchesPage from './components/BranchesPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import UsersAdminPage from './components/UsersAdminPage';
import CreateTicketModal from './components/CreateTicketModal';
import AgentAvatar from './components/AgentAvatar';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'tickets', label: 'Tickets', Icon: Ticket },
  { id: 'chat', label: 'Live Chat', Icon: MessageSquare },
  { id: 'customers', label: 'Customers', Icon: Users },
  { id: 'branches', label: 'Branches', Icon: Building2 },
  { id: 'reports', label: 'Reports', Icon: BarChart3 },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  tickets: 'Tickets',
  chat: 'Live Chat',
  customers: 'Branches',
  branches: 'Branches',
  reports: 'Reports',
  users: 'Users & access',
  settings: 'Settings',
};

function getModeFromHash(): 'agent' | 'portal' {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h.startsWith('portal') ? 'portal' : 'agent';
}

function AppShell() {
  const [mode, setMode] = useState<'agent' | 'portal'>(getModeFromHash);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { tickets, usingSupabase, currentAgent } = useTickets();
  const { user, loading: authLoading, requiresAuth, signOut, accountRole } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
    conversations,
  } = usePlatform();
  const openCount = tickets.filter((t) => t.status !== 'resolved' && !t.deleted_at).length;
  const chatBadge = conversations.filter((c) => c.status !== 'ended').length;

  useEffect(() => {
    const onHash = () => setMode(getModeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const goPortal = () => {
    window.location.hash = '#/portal';
    setMode('portal');
  };

  const goAgent = () => {
    window.location.hash = '#/';
    setMode('agent');
  };

  if (mode === 'portal') {
    return <CustomerPortal onBackToAgent={goAgent} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 text-zinc-500 text-sm">
        Loading…
      </div>
    );
  }

  if (requiresAuth && user && accountRole === 'customer') {
    return <CustomerPortal onBackToAgent={goAgent} />;
  }

  if (requiresAuth && !user) {
    return <LoginPage audience="agent" onOpenPortal={goPortal} />;
  }

  const searchResults =
    search.trim().length > 1
      ? tickets.filter(
          (t) =>
            t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.id.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 8)
      : [];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-zinc-200 bg-white">
        <div className="h-14 px-4 flex items-center gap-2 border-b border-zinc-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="white" />
              <path d="M12 3a9 9 0 0 1 9 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M12 21a9 9 0 0 1-9-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900">Nexus Ops</div>
            <div className="text-[10px] text-zinc-400">Agent workspace</div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => {
            if (id === 'users' && accountRole !== 'admin' && accountRole !== 'agent') return null;
            // Users page is admin-only in practice
            if (id === 'users' && accountRole !== 'admin') return null;
            const badge =
              id === 'tickets' && openCount > 0
                ? openCount
                : id === 'chat' && chatBadge > 0
                  ? chatBadge
                  : null;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveNav(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  activeNav === id
                    ? 'bg-violet-50 text-violet-700 font-medium'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{label}</span>
                {badge != null && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-100">
          <button
            type="button"
            onClick={goPortal}
            className="w-full text-left text-xs text-zinc-500 hover:text-violet-600 px-2 py-1.5"
          >
            Customer portal →
          </button>
          {usingSupabase && (
            <div className="px-2 text-[10px] text-emerald-600 mt-1">Live · Supabase</div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200 bg-white flex items-center gap-3 px-4 lg:px-6">
          <div className="text-sm font-semibold text-zinc-800">{PAGE_TITLES[activeNav] || 'Nexus Ops'}</div>
          <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
                {searchResults.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-50 last:border-0"
                    onClick={() => {
                      setActiveNav('tickets');
                      setSearch('');
                    }}
                  >
                    <span className="font-medium text-zinc-800">{t.id}</span>
                    <span className="text-zinc-500 ml-2">{t.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2" ref={notifRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-1 w-80 max-h-96 overflow-auto bg-white border border-zinc-200 rounded-xl shadow-xl z-30">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100">
                    <span className="text-sm font-semibold">Notifications</span>
                    <div className="flex gap-2">
                      <button type="button" className="text-[11px] text-violet-600" onClick={() => markAllNotificationsRead()}>
                        Read all
                      </button>
                      <button type="button" className="text-[11px] text-rose-500" onClick={() => deleteAllNotifications()}>
                        Delete all
                      </button>
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-zinc-400 text-center">No notifications</div>
                  ) : (
                    notifications.slice(0, 30).map((n) => (
                      <div
                        key={n.id}
                        className={`px-3 py-2.5 border-b border-zinc-50 text-sm ${
                          n.read ? 'opacity-60' : 'bg-violet-50/40'
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <button type="button" className="text-left flex-1" onClick={() => markNotificationRead(n.id)}>
                            <div className="font-medium text-zinc-800">{n.title}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{n.body}</div>
                          </button>
                          <button type="button" className="text-zinc-300 hover:text-rose-500" onClick={() => deleteNotification(n.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-100">
              <AgentAvatar name={currentAgent?.name || user?.email || 'Agent'} size={28} />
              <div className="hidden sm:block text-xs">
                <div className="font-medium text-zinc-800">{currentAgent?.name || user?.email || 'Agent'}</div>
                <div className="text-zinc-400 capitalize">{accountRole || 'agent'}</div>
              </div>
              {requiresAuth && (
                <button type="button" onClick={() => signOut()} className="text-[11px] text-zinc-400 hover:text-zinc-700 ml-1">
                  Sign out
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {activeNav === 'dashboard' && <Dashboard />}
          {activeNav === 'tickets' && <TicketsPage />}
          {activeNav === 'chat' && <LiveChatPage />}
          {activeNav === 'customers' && <CustomersPage />}
          {activeNav === 'branches' && <BranchesPage />}
          {activeNav === 'reports' && <ReportsPage />}
          {activeNav === 'users' && accountRole === 'admin' && <UsersAdminPage />}
          {activeNav === 'settings' && (
            <SettingsPage onOpenPortal={goPortal} onSignOut={requiresAuth ? signOut : undefined} />
          )}
        </main>
      </div>

      <CreateTicketModal />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <TicketProvider>
          <PlatformProvider>
            <AppShell />
          </PlatformProvider>
        </TicketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
