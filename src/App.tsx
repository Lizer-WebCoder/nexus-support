import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings2, ExternalLink } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricBar from './components/MetricBar';
import TicketPulse from './components/TicketPulse';
import Distribution from './components/Distribution';
import ChannelMix from './components/ChannelMix';
import MyQueue from './components/MyQueue';
import TeamStatus from './components/TeamStatus';
import TicketsPage from './components/TicketsPage';
import CustomersPage from './components/CustomersPage';
import TeamPage from './components/TeamPage';
import UsersAdminPage from './components/UsersAdminPage';
import SettingsPage from './components/SettingsPage';
import AnalyticsPage from './components/AnalyticsPage';
import KnowledgePage from './components/KnowledgePage';
import LiveChatPage from './components/LiveChatPage';
import CustomerPortal from './components/CustomerPortal';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import AutomationsPage from './components/AutomationsPage';
import MacrosPage from './components/MacrosPage';
import SurveysPage from './components/SurveysPage';
import QualityPage from './components/QualityPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import FormsPage from './components/FormsPage';
import ReleasesPage from './components/ReleasesPage';
import NotificationEffects from './components/NotificationEffects';
import { TicketProvider, useTickets } from './context/TicketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlatformProvider, usePlatform } from './context/PlatformContext';

function Dashboard() {
  const { announcements } = usePlatform();
  const active = announcements.filter((a) => a.active);
  return (
    <>
      {active.slice(0, 2).map((a) => (
        <div
          key={a.id}
          className={`rounded-xl border px-4 py-3 text-sm ${
            a.severity === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : a.severity === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-brand-50 border-brand-200 text-brand-800'
          }`}
        >
          <strong>{a.title}</strong> — {a.body}
        </div>
      ))}
      <MetricBar />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
        <div className="xl:col-span-2 space-y-4">
          <TicketPulse />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Distribution />
            <ChannelMix />
          </div>
          <MyQueue />
        </div>
        <TeamStatus />
      </div>
    </>
  );
}

const TITLES: Record<string, string> = {
  dashboard: 'Command Center',
  tickets: 'Tickets',
  customers: 'Customers',
  team: 'Team',
  users: 'Users & access',
  analytics: 'Analytics',
  knowledge: 'Knowledge',
  chat: 'Live Chat',
  automations: 'Automations',
  macros: 'Macros',
  surveys: 'Surveys',
  quality: 'Quality',
  announcements: 'Announcements',
  forms: 'Forms',
  releases: 'Releases',
  settings: 'Settings',
  profile: 'Profile',
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
      ? tickets
          .filter(
            (t) =>
              t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
              t.title.toLowerCase().includes(search.toLowerCase()) ||
              t.id.toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 8)
      : [];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <NotificationEffects />
      <Sidebar
        active={activeNav}
        onNavigate={setActiveNav}
        openCount={tickets.filter((t) => t.status !== 'resolved' && !t.deleted_at).length}
        chatCount={conversations.filter((c) => c.status !== 'ended').length}
        accountRole={accountRole}
        onOpenPortal={goPortal}
        usingSupabase={usingSupabase}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200 bg-white flex items-center gap-3 px-4 lg:px-6">
          <div className="text-sm font-semibold text-zinc-800">{TITLES[activeNav] || activeNav}</div>
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
            <button
              type="button"
              onClick={goPortal}
              className="hidden sm:flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-600 px-2 py-1"
            >
              <ExternalLink size={12} /> Portal
            </button>
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
                        className={`px-3 py-2.5 border-b border-zinc-50 text-sm ${n.read ? 'opacity-60' : 'bg-violet-50/40'}`}
                      >
                        <div className="flex justify-between gap-2">
                          <button type="button" className="text-left flex-1" onClick={() => markNotificationRead(n.id)}>
                            <div className="font-medium text-zinc-800">{n.title}</div>
                            <div className="text-xs text-zinc-500 mt-0.5">{n.body}</div>
                          </button>
                          <button type="button" className="text-zinc-300 hover:text-rose-500 text-xs" onClick={() => deleteNotification(n.id)}>
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button type="button" onClick={() => setActiveNav('profile')} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500">
              <Settings2 size={18} />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white text-[10px] font-bold flex items-center justify-center">
                {(currentAgent?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
              </div>
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

        <main className="flex-1 overflow-auto p-4 lg:p-6 space-y-4">
          {activeNav === 'dashboard' && <Dashboard />}
          {activeNav === 'tickets' && <TicketsPage />}
          {activeNav === 'customers' && <CustomersPage />}
          {activeNav === 'team' && <TeamPage />}
          {activeNav === 'users' && accountRole === 'admin' && <UsersAdminPage />}
          {activeNav === 'analytics' && <AnalyticsPage />}
          {activeNav === 'knowledge' && <KnowledgePage />}
          {activeNav === 'chat' && <LiveChatPage />}
          {activeNav === 'automations' && <AutomationsPage />}
          {activeNav === 'macros' && <MacrosPage />}
          {activeNav === 'surveys' && <SurveysPage />}
          {activeNav === 'quality' && <QualityPage />}
          {activeNav === 'announcements' && <AnnouncementsPage />}
          {activeNav === 'forms' && <FormsPage />}
          {activeNav === 'releases' && <ReleasesPage />}
          {activeNav === 'settings' && (
            <SettingsPage onOpenPortal={goPortal} onSignOut={requiresAuth ? signOut : undefined} />
          )}
          {activeNav === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <PlatformProvider>
          <AppShell />
        </PlatformProvider>
      </TicketProvider>
    </AuthProvider>
  );
}
