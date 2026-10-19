import { useState, useEffect } from 'react';
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
import { TicketProvider, useTickets } from './context/TicketContext';

function Dashboard() {
  return (
    <>
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
  customers: 'Customers',
  knowledge: 'Knowledge Base',
  chat: 'Live Chat',
  analytics: 'Analytics',
  team: 'Team',
  settings: 'Settings',
};

const WORKING = new Set(['dashboard', 'tickets', 'customers', 'knowledge', 'chat', 'analytics', 'team', 'settings']);

function getModeFromHash(): 'agent' | 'portal' {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h.startsWith('portal') ? 'portal' : 'agent';
}

function AppShell() {
  const [mode, setMode] = useState<'agent' | 'portal'>(getModeFromHash);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [search, setSearch] = useState('');
  const { tickets, usingSupabase } = useTickets();
  const openCount = tickets.filter((t) => t.status !== 'resolved').length;

  useEffect(() => {
    const onHash = () => setMode(getModeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
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

  const searchResults =
    search.trim().length > 1
      ? tickets.filter(
          (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.id.toLowerCase().includes(search.toLowerCase()) ||
            t.customer_name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active={activeNav} onNavigate={setActiveNav} ticketCount={openCount} />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">
              {TITLES[activeNav] || activeNav.charAt(0).toUpperCase() + activeNav.slice(1)}
            </h1>
            {!usingSupabase && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Local mode</span>
            )}
            {usingSupabase && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Supabase connected</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goPortal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 px-2.5 py-1.5 rounded-lg hover:bg-sky-50"
            >
              Customer portal <ExternalLink size={12} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets, customers..."
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                  {searchResults.slice(0, 8).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveNav('tickets'); setSearch(''); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-mono text-xs text-slate-400 mr-2">{t.id}</span>
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button onClick={() => setActiveNav('settings')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
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
          {activeNav === 'settings' && <SettingsPage onOpenPortal={goPortal} />}
          {!WORKING.has(activeNav) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-800 capitalize mb-2">{activeNav.replace('-', ' ')}</h2>
              <p className="text-slate-500 max-w-md mx-auto">
                Placeholder module. Core workflows are under Overview, Tickets, Customers, Knowledge Base, Live Chat, Analytics, Team, and Settings.
              </p>
              <button onClick={() => setActiveNav('dashboard')} className="mt-6 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700">
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
    <TicketProvider>
      <AppShell />
    </TicketProvider>
  );
}
