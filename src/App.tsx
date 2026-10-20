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
import SettingsPage from './components/SettingsPage';
import AnalyticsPage from './components/AnalyticsPage';
import KnowledgePage from './components/KnowledgePage';
import LiveChatPage from './components/LiveChatPage';
import CustomerPortal from './components/CustomerPortal';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import AutomationsPage from './components/AutomationsPage';
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
      <TicketPulse />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Distribution />
        <ChannelMix />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MyQueue />
        <TeamStatus />
      </div>
    </>
  );
}

const TITLES: Record<string, string> = {
  dashboard: 'Command Center',
  tickets: 'Tickets',
  customers: 'Branches',
  knowledge: 'Knowledge Base',
  chat: 'Live Chat',
  analytics: 'Analytics',
  team: 'Team',
  settings: 'Settings',
  profile: 'My Profile',
  automations: 'Automations',
  surveys: 'Surveys',
  quality: 'Quality',
  announcements: 'Announcements',
  forms: 'Forms',
  releases: 'Releases',
};

const WORKING = new Set(Object.keys(TITLES));

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
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, conversations } = usePlatform();
  const openCount = tickets.filter((t) => t.status !== 'resolved').length;
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
    return <LoginPage onOpenPortal={goPortal} />;
  }

  const searchResults =
    search.trim().length > 1
      ? tickets.filter(
          (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.id.toLowerCase().includes(search.toLowerCase()) ||
            t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
            (t.branch || '').toLowerCase().includes(search.toLowerCase())
        )
      : [];

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Agent';

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <Sidebar
        active={activeNav}
        onNavigate={setActiveNav}
        ticketCount={openCount}
        chatCount={chatBadge}
        userName={currentAgent?.name || displayName}
        userEmail={user?.email}
        avatarUrl={currentAgent?.avatar_url || (user?.user_metadata?.avatar_url as string | undefined) || null}
        onSignOut={requiresAuth ? signOut : undefined}
        onProfile={() => setActiveNav('profile')}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur border-b border-zinc-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
              {TITLES[activeNav] || activeNav}
            </h1>
            {!usingSupabase && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Local mode</span>
            )}
            {usingSupabase && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Supabase connected</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPortal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-50"
            >
              Customer portal <ExternalLink size={12} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets, branches..."
                className="pl-9 pr-4 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                  {searchResults.slice(0, 8).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setActiveNav('tickets'); setSearch(''); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 border-b border-zinc-100 last:border-0"
                    >
                      <span className="font-mono text-xs text-zinc-400 mr-2">{t.id}</span>
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-lg hover:bg-zinc-100 text-zinc-500"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-zinc-200 rounded-xl shadow-lg z-30 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-800">Notifications</span>
                    <button type="button" onClick={() => markAllNotificationsRead()} className="text-xs text-brand-600 hover:underline">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="text-xs text-zinc-400 p-4 text-center">No notifications</p>
                    )}
                    {notifications.slice(0, 20).map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link === 'tickets') setActiveNav('tickets');
                          if (n.link === 'chat') setActiveNav('chat');
                          setNotifOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 border-b border-zinc-50 hover:bg-zinc-50 ${!n.read ? 'bg-brand-50/60' : ''}`}
                      >
                        <div className="text-sm font-medium text-zinc-800">{n.title}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{n.body}</div>
                        <div className="text-[10px] text-zinc-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button type="button" onClick={() => setActiveNav('settings')} className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500">
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {activeNav === 'dashboard' && <Dashboard />}
          {activeNav === 'tickets' && <TicketsPage />}
          {activeNav === 'customers' && <CustomersPage />}
          {activeNav === 'knowledge' && <KnowledgePage />}
          {activeNav === 'chat' && <LiveChatPage />}
          {activeNav === 'analytics' && <AnalyticsPage />}
          {activeNav === 'team' && <TeamPage />}
          {activeNav === 'settings' && (
            <SettingsPage onOpenPortal={goPortal} onSignOut={requiresAuth ? signOut : undefined} />
          )}
          {activeNav === 'profile' && <ProfilePage />}
          {activeNav === 'automations' && <AutomationsPage />}
          {activeNav === 'surveys' && <SurveysPage />}
          {activeNav === 'quality' && <QualityPage />}
          {activeNav === 'announcements' && <AnnouncementsPage />}
          {activeNav === 'forms' && <FormsPage />}
          {activeNav === 'releases' && <ReleasesPage />}
          {!WORKING.has(activeNav) && (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-card p-12 text-center">
              <h2 className="text-xl font-semibold text-zinc-800 capitalize mb-2">{activeNav}</h2>
              <p className="text-zinc-500">Module not found.</p>
              <button type="button" onClick={() => setActiveNav('dashboard')} className="mt-6 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
                Back to Overview
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <PlatformProvider>
          <NotificationEffects />
          <AppShell />
        </PlatformProvider>
      </TicketProvider>
    </AuthProvider>
  );
}
